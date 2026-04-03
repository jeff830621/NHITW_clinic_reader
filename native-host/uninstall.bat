@echo off
echo Uninstalling NHITW Clinic Reader Native Host...
reg delete "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.nhitw.host" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.nhitw.host" /f >nul 2>&1
if exist "C:\nhitw-host" rmdir /s /q "C:\nhitw-host"
echo Done.
pause
