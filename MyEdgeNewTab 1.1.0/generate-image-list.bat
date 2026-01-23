@echo off
:: Switch to the plugin directory
cd /d "%~dp0"
:: Set CMD encoding to GBK (compatible with Chinese file names)
chcp 936 > nul
echo ==============================
echo Generating image list...
echo ==============================
:: Run the generate script
node generate-image-list.js
echo ==============================
echo Done! Press any key to close.
echo ==============================
pause > nul