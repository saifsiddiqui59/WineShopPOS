@echo off
setlocal EnableExtensions

rem WineShopPOS V4 Preview - one-time Windows app launcher setup.
rem This creates Desktop + Start Menu shortcuts that launch Edge in app mode.
rem It does not require administrator rights and does not modify Chrome/Edge policies.

set "APP_NAME=WineShopPOS V4 Preview"
set "APP_URL=https://wspv35c9453b6e9a1.z29.web.core.windows.net/"
set "EDGE_EXE="

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined EDGE_EXE if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined EDGE_EXE if exist "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"

if not defined EDGE_EXE (
  echo.
  echo ERROR: Microsoft Edge was not found on this PC.
  echo Install Microsoft Edge and run this setup again.
  pause
  exit /b 1
)

echo Installing %APP_NAME% shortcuts...

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$edge=$env:EDGE_EXE;" ^
  "$url=$env:APP_URL;" ^
  "$name=$env:APP_NAME;" ^
  "$ws=New-Object -ComObject WScript.Shell;" ^
  "$args='--app=' + [char]34 + $url + [char]34 + ' --start-maximized';" ^
  "$desktop=[Environment]::GetFolderPath('Desktop');" ^
  "$programs=[Environment]::GetFolderPath('Programs');" ^
  "$desktopLink=Join-Path $desktop ($name + '.lnk');" ^
  "$startLink=Join-Path $programs ($name + '.lnk');" ^
  "$s=$ws.CreateShortcut($desktopLink); $s.TargetPath=$edge; $s.Arguments=$args; $s.WorkingDirectory=(Split-Path $edge); $s.IconLocation=$edge + ',0'; $s.Description='WineShopPOS V4 Preview'; $s.Save();" ^
  "$s=$ws.CreateShortcut($startLink); $s.TargetPath=$edge; $s.Arguments=$args; $s.WorkingDirectory=(Split-Path $edge); $s.IconLocation=$edge + ',0'; $s.Description='WineShopPOS V4 Preview'; $s.Save();" ^
  "Write-Host 'Desktop shortcut:' $desktopLink; Write-Host 'Start Menu shortcut:' $startLink;"

if errorlevel 1 (
  echo.
  echo ERROR: Shortcut creation failed.
  pause
  exit /b 1
)

echo.
echo Setup complete. Opening WineShopPOS V4 Preview now...
start "" "%EDGE_EXE%" --app="%APP_URL%" --start-maximized
exit /b 0
