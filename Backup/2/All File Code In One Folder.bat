@echo off
setlocal enabledelayedexpansion

set "TARGET_DIR=%CD%"
set "OUTPUT_FILE=%CD%\FolderStructureWithContent.txt"

echo Generating folder structure and file contents...

:: Create or clear the output file
echo. > "%OUTPUT_FILE%"

:: Run tree command and save output to text file
echo Folder Structure of %TARGET_DIR% >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
tree "%TARGET_DIR%" /F /A >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
echo ================================================== >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

:: Loop through all files and append content
for /r "%TARGET_DIR%" %%F in (*) do (
    echo Processing: %%F
    echo ------------------------ >> "%OUTPUT_FILE%"
    echo Above is %%~nxF file code >> "%OUTPUT_FILE%"
    echo ------------------------ >> "%OUTPUT_FILE%"
    type "%%F" >> "%OUTPUT_FILE%"
    echo. >> "%OUTPUT_FILE%"
    echo ================================================== >> "%OUTPUT_FILE%"
    echo. >> "%OUTPUT_FILE%"
)

:: Open the output file automatically
start "" "%OUTPUT_FILE%"

echo Folder structure with file contents saved to %OUTPUT_FILE%
pause
