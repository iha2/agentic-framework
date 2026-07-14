@echo off
setlocal
REM Graphify setup kit — Windows launcher (delegates to install.ps1)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" %*
exit /b %ERRORLEVEL%
