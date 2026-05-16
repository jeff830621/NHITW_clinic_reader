@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

REM ============================================================
REM  NHITW Clinic Reader - Native Host Installer
REM ============================================================
REM  部署多台電腦時：先編輯下方「DEPLOY CONFIG」區塊，存檔，
REM  然後把整個 native-host 資料夾拷貝到每台電腦執行 install.bat
REM  即可全部裝成同樣的設定（按 Enter 即可，不用每台都打字）。
REM ============================================================

REM === DEPLOY CONFIG (部署前在這裡編輯) =====================
set "DEFAULT_SHARED_FOLDER=\\SERVER\shared\nhitw-data"
REM 擴充套件 ID 已透過 manifest key 鎖定，不會隨重裝改變
set "FIXED_EXT_ID=kilmdgbkklopaopdfahekedadkmfpfhk"
REM ===========================================================

set "INSTALL_DIR=C:\nhitw-host"
set "EXISTING_FOLDER="

echo ============================================
echo  NHITW Clinic Reader - Native Host Installer
echo ============================================
echo.

REM ---- Detect existing install ----
if exist "%INSTALL_DIR%\config.json" (
    echo [偵測到既有安裝] %INSTALL_DIR%
    for /f "delims=" %%a in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content '%INSTALL_DIR%\config.json' -Raw ^| ConvertFrom-Json).sharedFolderPath" 2^>nul') do set "EXISTING_FOLDER=%%a"
    if not "!EXISTING_FOLDER!"=="" (
        echo  目前共享資料夾: !EXISTING_FOLDER!
        set "DEFAULT_SHARED_FOLDER=!EXISTING_FOLDER!"
    )
    echo.
    echo  繼續執行會覆蓋既有安裝（保留設定當預設）
    echo.
)

REM ---- Prompt for shared folder ----
echo 共享資料夾路徑（直接按 Enter 使用預設值）
echo   預設: %DEFAULT_SHARED_FOLDER%
set /p "SHARED_FOLDER=> "
if "!SHARED_FOLDER!"=="" set "SHARED_FOLDER=%DEFAULT_SHARED_FOLDER%"
echo.

REM ---- Confirmation ----
echo ============================================
echo  即將安裝
echo    安裝目錄:     %INSTALL_DIR%
echo    共享資料夾:   !SHARED_FOLDER!
echo    擴充套件 ID:  %FIXED_EXT_ID%
echo ============================================
set /p "CONFIRM=確認安裝? (Y/n): "
if /i "!CONFIRM!"=="n" (
    echo 已取消。
    pause
    exit /b 1
)
echo.

REM ---- [1/6] Create install directory ----
echo [1/6] 建立安裝目錄...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM ---- [2/6] Copy files ----
echo [2/6] 複製檔案...
copy /Y "%~dp0nhitw_host.ps1" "%INSTALL_DIR%\" >nul
copy /Y "%~dp0nhitw_host_launcher.bat" "%INSTALL_DIR%\" >nul

REM ---- [3/6] Write config ----
echo [3/6] 寫入設定檔...
(
    echo {
    echo   "sharedFolderPath": "!SHARED_FOLDER:\=\\!",
    echo   "retentionDays": 7
    echo }
) > "%INSTALL_DIR%\config.json"

REM ---- [4/6] Prepare shared folder ----
echo [4/6] 檢查共享資料夾...
if not exist "!SHARED_FOLDER!" (
    echo     建立共享資料夾: !SHARED_FOLDER!
    mkdir "!SHARED_FOLDER!" 2>nul
    if errorlevel 1 (
        echo     [警告] 無法建立共享資料夾，可能是網路路徑無權限
        echo     請手動確認 !SHARED_FOLDER! 可寫入
    )
)

REM ---- [5/6] Write Native Messaging manifest ----
echo [5/6] 寫入 Native Messaging manifest...
set "MANIFEST_PATH=%INSTALL_DIR%\com.nhitw.host.json"
set "LAUNCHER_PATH=%INSTALL_DIR%\nhitw_host_launcher.bat"
(
    echo {
    echo   "name": "com.nhitw.host",
    echo   "description": "NHITW Clinic Reader - Shared Folder Bridge",
    echo   "path": "!LAUNCHER_PATH:\=\\!",
    echo   "type": "stdio",
    echo   "allowed_origins": [
    echo     "chrome-extension://%FIXED_EXT_ID%/"
    echo   ]
    echo }
) > "%MANIFEST_PATH%"

REM ---- [6/6] Register with Chrome/Edge ----
echo [6/6] 註冊到 Chrome 和 Edge...
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.nhitw.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
reg add "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.nhitw.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul

echo.
echo ============================================
echo  安裝完成
echo    安裝目錄:     %INSTALL_DIR%
echo    共享資料夾:   !SHARED_FOLDER!
echo    擴充套件 ID:  %FIXED_EXT_ID%
echo ============================================
echo.
echo  下一步：
echo    1. 重新啟動 Chrome / Edge
echo    2. 在擴充套件設定中點「檢查連線」確認運作
echo.
pause
