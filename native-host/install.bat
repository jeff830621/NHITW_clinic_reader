@echo off
setlocal enabledelayedexpansion

REM ============== DEPLOY CONFIG ==============
REM 多台電腦部署時，把下面預設值改成你的設定，存檔後整個 native-host
REM 資料夾就是部署包，每台電腦複製過去雙擊 install.bat 一路按 Enter 即可。
set "DEFAULT_SHARED_FOLDER=\\kt-server\kthis\Chart"
set "DEFAULT_EXT_ID=kilmdgbkklopaopdfahekedadkmfpfhk"
REM ============ END DEPLOY CONFIG ============

echo ============================================
echo  NHITW 診間報告產生器 - Native Host 安裝
echo ============================================
echo.

set "INSTALL_DIR=C:\nhitw-host"

set /p "SHARED_FOLDER=請輸入共享資料夾路徑（預設：%DEFAULT_SHARED_FOLDER%）: "
if "!SHARED_FOLDER!"=="" set "SHARED_FOLDER=%DEFAULT_SHARED_FOLDER%"

set /p "EXT_ID=請輸入 Chrome 擴充套件 ID（預設：%DEFAULT_EXT_ID%）: "
if "!EXT_ID!"=="" set "EXT_ID=%DEFAULT_EXT_ID%"

echo.
echo [1/5] 建立安裝資料夾：%INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/5] 複製檔案 ...
copy /Y "%~dp0nhitw_host.ps1" "%INSTALL_DIR%\" >nul
copy /Y "%~dp0nhitw_host_launcher.bat" "%INSTALL_DIR%\" >nul

echo [3/5] 寫入設定檔 ...
(
echo {
echo   "sharedFolderPath": "!SHARED_FOLDER:\=\\!",
echo   "retentionDays": 7
echo }
) > "%INSTALL_DIR%\config.json"

if not exist "!SHARED_FOLDER!" (
    echo     建立共享資料夾：!SHARED_FOLDER!
    mkdir "!SHARED_FOLDER!"
)

echo [4/5] 寫入 Native Messaging manifest ...
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

echo [5/5] 寫入登錄檔 ...
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.nhitw.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
reg add "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.nhitw.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul

echo.
echo ============================================
echo  安裝完成！
echo  安裝路徑：    %INSTALL_DIR%
echo  共享資料夾：  !SHARED_FOLDER!
echo  擴充套件 ID： !EXT_ID!
echo ============================================
echo.
echo 請在櫃檯電腦上執行此安裝程式。
echo 請確認兩端電腦都能存取上述共享資料夾。
echo.
pause
