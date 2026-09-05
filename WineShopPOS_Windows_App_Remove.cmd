@echo off
setlocal EnableExtensions

set "APP_NAME=WineShopPOS"

echo Removing WineShopPOS shortcuts...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$name=$env:APP_NAME;" ^
  "$desktop=Join-Path ([Environment]::GetFolderPath('Desktop')) ($name + '.lnk');" ^
  "$start=Join-Path ([Environment]::GetFolderPath('Programs')) ($name + '.lnk');" ^
  "Remove-Item -LiteralPath $desktop -Force -ErrorAction SilentlyContinue;" ^
  "Remove-Item -LiteralPath $start -Force -ErrorAction SilentlyContinue;" ^
  "Write-Host 'Removed WineShopPOS app shortcuts.';"

exit /b %errorlevel%
