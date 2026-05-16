# Test helper — sends a message to nhitw_host.ps1 and prints the response.
param([string]$jsonMessage)

$hostScript = Join-Path $PSScriptRoot "nhitw_host.ps1"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonMessage)
$length = [System.BitConverter]::GetBytes($bytes.Length)

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "powershell.exe"
$psi.Arguments = "-ExecutionPolicy Bypass -File `"$hostScript`""
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true

$proc = [System.Diagnostics.Process]::Start($psi)
$proc.StandardInput.BaseStream.Write($length, 0, 4)
$proc.StandardInput.BaseStream.Write($bytes, 0, $bytes.Length)
$proc.StandardInput.BaseStream.Flush()
$proc.StandardInput.Close()

$respLenBytes = New-Object byte[] 4
$proc.StandardOutput.BaseStream.Read($respLenBytes, 0, 4) | Out-Null
$respLen = [System.BitConverter]::ToInt32($respLenBytes, 0)
$respBytes = New-Object byte[] $respLen
$proc.StandardOutput.BaseStream.Read($respBytes, 0, $respLen) | Out-Null
$response = [System.Text.Encoding]::UTF8.GetString($respBytes)

Write-Host "Response: $response"
$proc.WaitForExit()
