@echo off
set "TARGET_DIR=%CD%"
set "OUTPUT_FILE=%CD%\FolderStructure.txt"

echo Generating folder structure...

:: Run tree command and save output to text file
tree "%TARGET_DIR%" /F /A > "%OUTPUT_FILE%"

echo Folder structure saved to %OUTPUT_FILE%

:: Open the output file automatically
start "" "%OUTPUT_FILE%"

pause
