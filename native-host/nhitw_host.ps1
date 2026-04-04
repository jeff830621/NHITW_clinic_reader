# nhitw_host.ps1 — Native Messaging Host for NHITW Clinic Reader
$ErrorActionPreference = "Stop"

# --- Config ---
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $scriptDir "config.json"

if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
} else {
    $config = @{ sharedFolderPath = "C:\nhitw-data"; retentionDays = 7 }
}

$sharedFolder = $config.sharedFolderPath
$retentionDays = if ($config.retentionDays) { $config.retentionDays } else { 7 }

# --- Native Messaging I/O ---
function Read-Message {
    $stdin = [System.Console]::OpenStandardInput()
    $lengthBytes = New-Object byte[] 4
    $bytesRead = $stdin.Read($lengthBytes, 0, 4)
    if ($bytesRead -ne 4) { return $null }
    $length = [System.BitConverter]::ToInt32($lengthBytes, 0)
    if ($length -le 0 -or $length -gt 10485760) { return $null }
    $messageBytes = New-Object byte[] $length
    $totalRead = 0
    while ($totalRead -lt $length) {
        $read = $stdin.Read($messageBytes, $totalRead, $length - $totalRead)
        if ($read -eq 0) { return $null }
        $totalRead += $read
    }
    $messageText = [System.Text.Encoding]::UTF8.GetString($messageBytes)
    return $messageText | ConvertFrom-Json
}

function Write-Message($response) {
    $json = $response | ConvertTo-Json -Depth 20 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $length = [System.BitConverter]::GetBytes($bytes.Length)
    $stdout = [System.Console]::OpenStandardOutput()
    $stdout.Write($length, 0, 4)
    $stdout.Write($bytes, 0, $bytes.Length)
    $stdout.Flush()
}

function Send-Error($code, $message) {
    Write-Message @{ success = $false; error = $code; message = $message }
}

# --- Helpers ---
function Get-DateFolder($date) {
    return Join-Path $sharedFolder $date
}

function Ensure-DateFolder($date) {
    $folder = Get-DateFolder $date
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }
    return $folder
}

function Get-TodayString {
    return (Get-Date).ToString("yyyy-MM-dd")
}

# --- Actions ---
function Action-WritePatient($msg) {
    try {
        $date = if ($msg.date) { $msg.date } else { Get-TodayString }
        $folder = Ensure-DateFolder $date
        $timestamp = [int][double]::Parse((Get-Date -UFormat %s))
        $filename = "$($msg.patient_id)_$timestamp.json"
        $filepath = Join-Path $folder $filename

        $msg.data | ConvertTo-Json -Depth 20 | Set-Content -Path $filepath -Encoding UTF8

        $manifestPath = Join-Path $folder "manifest.json"
        if (Test-Path $manifestPath) {
            $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        } else {
            $manifest = @{ date = $date; patients = @() }
        }

        $existingPatients = @($manifest.patients | Where-Object { $_.id -ne $msg.patient_id })

        $oldEntry = $manifest.patients | Where-Object { $_.id -eq $msg.patient_id } | Select-Object -First 1
        if ($oldEntry -and $oldEntry.filename) {
            $oldPath = Join-Path $folder $oldEntry.filename
            if (Test-Path $oldPath) { Remove-Item $oldPath -Force }
        }

        $newEntry = @{
            id = $msg.patient_id
            name = $msg.name
            timestamp = $timestamp
            filename = $filename
        }
        $updatedPatients = @($existingPatients) + @($newEntry)
        $manifest.patients = $updatedPatients
        $manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath -Encoding UTF8

        Write-Message @{ success = $true; filename = $filename; date = $date }
    } catch {
        Send-Error "WRITE_FAILED" $_.Exception.Message
    }
}

function Action-ReadManifest($msg) {
    try {
        $date = if ($msg.date) { $msg.date } else { Get-TodayString }
        $manifestPath = Join-Path (Get-DateFolder $date) "manifest.json"
        if (-not (Test-Path $manifestPath)) {
            Write-Message @{ success = $true; date = $date; patients = @() }
            return
        }
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        # Rebuild each patient as a fresh hashtable to avoid PSCustomObject serialization issues
        $patientArray = @()
        foreach ($p in @($manifest.patients)) {
            if ($p) {
                $patientArray += @{
                    id = if ($p.id) { $p.id.ToString() } else { "" }
                    name = if ($p.name) { $p.name.ToString() } else { "" }
                    timestamp = $p.timestamp
                    filename = if ($p.filename) { $p.filename.ToString() } else { "" }
                }
            }
        }
        $dateStr = if ($manifest.date) { $manifest.date.ToString() } else { $date }
        Write-Message @{ success = $true; date = $dateStr; patients = $patientArray }
    } catch {
        Send-Error "READ_MANIFEST_FAILED" $_.Exception.Message
    }
}

function Action-ReadPatient($msg) {
    try {
        $date = if ($msg.date) { $msg.date } else { Get-TodayString }
        $filepath = Join-Path (Get-DateFolder $date) $msg.filename
        if (-not (Test-Path $filepath)) {
            Send-Error "FILE_NOT_FOUND" "Patient file not found: $($msg.filename)"
            return
        }
        # Send raw JSON string to avoid PSCustomObject serialization depth issues
        $rawJson = Get-Content $filepath -Raw
        Write-Message @{ success = $true; rawData = $rawJson }
    } catch {
        Send-Error "READ_PATIENT_FAILED" $_.Exception.Message
    }
}

function Action-SearchPatient($msg) {
    try {
        $results = @()
        $folders = Get-ChildItem -Path $sharedFolder -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            Select-Object -First 30
        foreach ($folder in $folders) {
            $manifestPath = Join-Path $folder.FullName "manifest.json"
            if (Test-Path $manifestPath) {
                $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
                $matches = @($manifest.patients | Where-Object {
                    $_.id -like "*$($msg.query)*" -or $_.name -like "*$($msg.query)*"
                })
                foreach ($match in $matches) {
                    if ($match) {
                        $results += @{
                            id = if ($match.id) { $match.id.ToString() } else { "" }
                            name = if ($match.name) { $match.name.ToString() } else { "" }
                            date = if ($manifest.date) { $manifest.date.ToString() } else { $folder.Name }
                            timestamp = $match.timestamp
                            filename = if ($match.filename) { $match.filename.ToString() } else { "" }
                        }
                    }
                }
            }
        }
        Write-Message @{ success = $true; results = @($results) }
    } catch {
        Send-Error "SEARCH_FAILED" $_.Exception.Message
    }
}

function Action-Cleanup($msg) {
    try {
        $days = if ($msg.retentionDays) { $msg.retentionDays } else { $retentionDays }
        $cutoff = (Get-Date).AddDays(-$days).ToString("yyyy-MM-dd")
        $removed = 0
        $folders = Get-ChildItem -Path $sharedFolder -Directory -ErrorAction SilentlyContinue
        foreach ($folder in $folders) {
            if ($folder.Name -lt $cutoff -and $folder.Name -match '^\d{4}-\d{2}-\d{2}$') {
                Remove-Item $folder.FullName -Recurse -Force
                $removed++
            }
        }
        Write-Message @{ success = $true; removedFolders = $removed }
    } catch {
        Send-Error "CLEANUP_FAILED" $_.Exception.Message
    }
}

# --- Main ---
# Auto-cleanup on startup
try {
    if (Test-Path $sharedFolder) {
        $cutoff = (Get-Date).AddDays(-$retentionDays).ToString("yyyy-MM-dd")
        $folders = Get-ChildItem -Path $sharedFolder -Directory -ErrorAction SilentlyContinue
        foreach ($folder in $folders) {
            if ($folder.Name -lt $cutoff -and $folder.Name -match '^\d{4}-\d{2}-\d{2}$') {
                Remove-Item $folder.FullName -Recurse -Force
            }
        }
    }
} catch { }

# Process single message
$message = Read-Message
if ($null -eq $message) { exit 0 }

switch ($message.action) {
    "write_patient"  { Action-WritePatient $message }
    "read_manifest"  { Action-ReadManifest $message }
    "read_patient"   { Action-ReadPatient $message }
    "search_patient" { Action-SearchPatient $message }
    "cleanup"        { Action-Cleanup $message }
    default          { Send-Error "UNKNOWN_ACTION" "Unknown action: $($message.action)" }
}
