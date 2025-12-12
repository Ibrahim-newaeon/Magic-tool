@echo off
REM Docker Run Script for New Aeon Magic Apps (Windows)
REM Usage: docker-run.bat [command]
REM Commands: start, stop, rebuild, logs, shell

setlocal EnableDelayedExpansion

set APP_NAME=new-aeon-magic
set IMAGE_NAME=magic-tool
set PORT=8080

REM Header
echo.
echo ========================================
echo      New Aeon Magic Apps - Docker
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [X] Docker is not running. Please start Docker Desktop first.
    exit /b 1
)

REM Load environment from .env.local if exists
if exist .env.local (
    for /f "usebackq tokens=1,* delims==" %%a in (".env.local") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" set "%%a=%%b"
    )
    echo [OK] Loaded environment from .env.local
) else if exist .env (
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" set "%%a=%%b"
    )
    echo [OK] Loaded environment from .env
) else (
    echo [!] No .env.local or .env file found
    echo [!] Create .env.local with: VITE_GEMINI_API_KEY=your_api_key
)

REM Parse command
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=start

if "%COMMAND%"=="start" goto start
if "%COMMAND%"=="stop" goto stop
if "%COMMAND%"=="rebuild" goto rebuild
if "%COMMAND%"=="logs" goto logs
if "%COMMAND%"=="shell" goto shell
if "%COMMAND%"=="status" goto status
if "%COMMAND%"=="help" goto help
if "%COMMAND%"=="--help" goto help
if "%COMMAND%"=="-h" goto help

echo [X] Unknown command: %COMMAND%
goto help

:start
echo Starting Magic Tool...
echo.

REM Check if container exists
docker ps -a --format "{{.Names}}" | findstr /x "%APP_NAME%" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Starting existing container...
    docker start %APP_NAME%
) else (
    echo [OK] Building Docker image...
    docker build -t %IMAGE_NAME% .

    echo [OK] Creating and starting container...
    docker run -d ^
        --name %APP_NAME% ^
        -p %PORT%:%PORT% ^
        -e VITE_GEMINI_API_KEY=%VITE_GEMINI_API_KEY% ^
        -v "%cd%:/app" ^
        -v "/app/node_modules" ^
        %IMAGE_NAME%
)

echo.
echo [OK] Magic Tool is running!
echo.
echo     Open http://localhost:%PORT% in your browser
echo.
goto end

:stop
echo Stopping Magic Tool...
docker ps --format "{{.Names}}" | findstr /x "%APP_NAME%" >nul 2>&1
if %errorlevel%==0 (
    docker stop %APP_NAME%
    echo [OK] Container stopped
) else (
    echo [!] Container is not running
)
goto end

:rebuild
echo Rebuilding Magic Tool...
echo.

REM Stop and remove existing container
docker ps -a --format "{{.Names}}" | findstr /x "%APP_NAME%" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Removing existing container...
    docker rm -f %APP_NAME%
)

REM Remove existing image
docker images --format "{{.Repository}}" | findstr /x "%IMAGE_NAME%" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Removing existing image...
    docker rmi %IMAGE_NAME%
)

goto start

:logs
echo Showing logs (Ctrl+C to exit)...
echo.
docker logs -f %APP_NAME%
goto end

:shell
echo Opening shell in container...
docker exec -it %APP_NAME% /bin/sh
goto end

:status
docker ps --format "{{.Names}}" | findstr /x "%APP_NAME%" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Magic Tool is RUNNING
    echo.
    docker ps --filter "name=%APP_NAME%" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
) else (
    echo [!] Magic Tool is NOT running
)
goto end

:help
echo Usage: docker-run.bat [command]
echo.
echo Commands:
echo   start     Start the application (default)
echo   stop      Stop the application
echo   rebuild   Rebuild and restart the container
echo   logs      Show container logs
echo   shell     Open a shell in the container
echo   status    Show container status
echo   help      Show this help message
echo.
echo Examples:
echo   docker-run.bat              Start the app
echo   docker-run.bat rebuild      Rebuild from scratch
echo   docker-run.bat logs         View logs
echo.
goto end

:end
endlocal
