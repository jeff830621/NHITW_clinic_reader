@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  NHITW Clinic Reader - Native Host Installer
echo ============================================
echo.

set "INSTALL_DIR=C:\nhitw-host"

REM Re-running the installer (e.g. to pick up a new extension ID) must not force
REM the clinic to retype its shared-folder path: reuse the one already saved in
REM config.json as the default, so the re-run is just "press Enter".
set "DEFAULT_FOLDER=\\kt-server\kthis\Chart"
if exist "%INSTALL_DIR%\config.json" (
    for /f "usebackq delims=" %%p in (`powershell -NoProfile -Command "(Get-Content '%INSTALL_DIR%\config.json' -Raw | ConvertFrom-Json).sharedFolderPath"`) do set "DEFAULT_FOLDER=%%p"
)
set /p "SHARED_FOLDER=Enter shared folder path (default: !DEFAULT_FOLDER!): "
if "!SHARED_FOLDER!"=="" set "SHARED_FOLDER=!DEFAULT_FOLDER!"

REM Extension IDs allowed to talk to this host. All stay allowed so a clinic
REM can migrate between install methods without breaking the bridge.
REM   EXT_ID_1 = classic unpacked/dev install
REM   EXT_ID_2 = Edge Add-ons store build
REM   EXT_ID_3 = Chrome Web Store build (filled in once the store assigns it)
set "EXT_ID_1=kilmdgbkklopaopdfahekedadkmfpfhk"
set "EXT_ID_2=ffopjenekhkampkfckmbegbglnebhjib"
set "EXT_ID_3="

echo.
echo [1/5] Creating install directory: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/5] Copying files...
copy /Y "%~dp0nhitw_host.ps1" "%INSTALL_DIR%\" >nul
copy /Y "%~dp0nhitw_host_launcher.bat" "%INSTALL_DIR%\" >nul

echo [3/5] Writing config...
(
echo {
echo   "sharedFolderPath": "!SHARED_FOLDER:\=\\!",
echo   "retentionDays": 40
echo }
) > "%INSTALL_DIR%\config.json"

if not exist "!SHARED_FOLDER!" (
    echo     Creating shared folder: !SHARED_FOLDER!
    mkdir "!SHARED_FOLDER!"
)

echo [4/5] Writing Native Messaging manifest...
set "MANIFEST_PATH=%INSTALL_DIR%\com.nhitw.host.json"
set "LAUNCHER_PATH=%INSTALL_DIR%\nhitw_host_launcher.bat"
(
echo {
echo   "name": "com.nhitw.host",
echo   "description": "NHITW Clinic Reader - Shared Folder Bridge",
echo   "path": "!LAUNCHER_PATH:\=\\!",
echo   "type": "stdio",
echo   "allowed_origins": [
set "ORIGINS="
for %%I in ("!EXT_ID_1!" "!EXT_ID_2!" "!EXT_ID_3!") do (
    if not "%%~I"=="" (
        if defined ORIGINS (set "ORIGINS=!ORIGINS!,") 
        set "ORIGINS=!ORIGINS!    "chrome-extension://%%~I/""
    )
)
echo !ORIGINS!
echo   ]
echo }
) > "%MANIFEST_PATH%"

echo [5/5] Setting registry...
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.nhitw.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
reg add "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.nhitw.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul

echo.
echo ============================================
echo  Installation complete!
echo  Install dir:    %INSTALL_DIR%
echo  Shared folder:  !SHARED_FOLDER!
echo  Extension IDs:  !EXT_ID_1! !EXT_ID_2! !EXT_ID_3!
echo ============================================
echo.
echo Run this script on BOTH the front desk and consultation room computers.
echo Make sure the shared folder path is accessible from both machines.
echo.
pause
