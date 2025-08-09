@echo off

rem Define variables
set SERVER_PATH=.\server
set CLIENT_PATH=.\client

rem Targets
:all
call :check_composer
call :install_composer_packages
call :check_env
call :update_env
call :serve
call :install_client_deps
call :check_client_deps
call :serve_client
goto :eof

:check_composer
rem Check if composer is installed
where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo Composer is not installed.
    exit /b 1
)
exit /b 0

:install_composer_packages
rem Run composer install
cd %SERVER_PATH%
composer install
cd ..
exit /b 0

:check_env
rem Check if .env exists
if not exist %SERVER_PATH%\.env (
    copy %SERVER_PATH%\.env.example %SERVER_PATH%\.env
)
exit /b 0

:update_env
rem Update .env with current path
set "path=%cd%"
set "DB_DATABASE=%path%\server\database\database.sqlite"
call :replace_str %SERVER_PATH%\.env DB_DATABASE "DB_DATABASE=%DB_DATABASE%"
exit /b 0

:replace_str
rem Helper function to replace a string in a file
setlocal
set "file=%1"
set "search=%2"
set "replace=%3"
set "tempfile=%file%.tmp"

(for /f "delims=" %%i in (%file%) do (
    set "line=%%i"
    call set "line=%%line:%search%=%replace%%%"
    echo !line!
)) >%tempfile%

move /y %tempfile% %file% >nul
exit /b 0

:serve
rem Run php artisan serve
cd %SERVER_PATH%
start php artisan serve --port 3000
cd ..
exit /b 0

:check_client_deps
rem Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm is not installed.
    exit /b 1
)
exit /b 0

:install_client_deps
rem Install client dependencies
cd %CLIENT_PATH%
npm install
cd ..
exit /b 0

:serve_client
rem Serve client (npm run dev)
cd %CLIENT_PATH%
npm run dev
cd ..
exit /b 0