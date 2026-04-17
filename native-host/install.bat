@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  NHITW Clinic Reader - Native Host Installer
echo ============================================
echo.

set "INSTALL_DIR=C:\nhitw-host"

set /p "SHARED_FOLDER=Enter shared folder path (default: C:\nhitw-data): "
if "!SHARED_FOLDER!"=="" set "SHARED_FOLDER=C:\nhitw-data"

set "DEFAULT_EXT_ID=kilmdgbkklopaopdfahekedadkmfpfhk"
set /p "EXT_ID=Enter Chrome extension ID (default: %DEFAULT_EXT_ID%): "
if "!EXT_ID!"=="" set "EXT_ID=%DEFAULT_EXT_ID%"

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
echo   "retentionDays": 7
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
echo     "chrome-extension://!EXT_ID!/"
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
echo  Extension ID:   !EXT_ID!
echo ============================================
echo.
echo Run this script on BOTH the front desk and consultation room computers.
echo Make sure the shared folder path is accessible from both machines.
echo.
pause
