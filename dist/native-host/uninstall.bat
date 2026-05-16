@echo off
setlocal
chcp 65001 >nul 2>&1
echo ============================================
echo  NHITW Clinic Reader - Native Host Uninstaller
echo ============================================
echo.

set "INSTALL_DIR=C:\nhitw-host"

set /p "CONFIRM=確認移除 Native Host? (Y/n): "
if /i "%CONFIRM%"=="n" (
    echo 已取消。
    pause
    exit /b 1
)

echo.
echo [1/3] 移除 Chrome 註冊...
reg delete "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.nhitw.host" /f >nul 2>&1

echo [2/3] 移除 Edge 註冊...
reg delete "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.nhitw.host" /f >nul 2>&1

echo [3/3] 刪除安裝目錄: %INSTALL_DIR%
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%"

echo.
echo 已完成。共享資料夾的內容**沒有**被刪除（避免誤刪報告檔）。
echo.
pause
