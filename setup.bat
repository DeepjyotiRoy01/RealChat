@echo off
REM RealChat2 - Windows Setup Script
REM =================================
REM This script automates the setup process for RealChat2 on Windows
REM Run this script from the root directory of the project

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+)
set "BLUE=[94m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "PURPLE=[95m"
set "CYAN=[96m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_header
echo %PURPLE%================================%NC%
echo %PURPLE%~1%NC%
echo %PURPLE%================================%NC%
goto :eof

REM Function to check if command exists
:command_exists
where %1 >nul 2>&1
if %errorlevel% equ 0 (
    set "exists=true"
) else (
    set "exists=false"
)
goto :eof

REM Function to check Node.js version
:check_node_version
call :command_exists node
if "%exists%"=="true" (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    set NODE_VERSION=!NODE_VERSION:~1!
    for /f "tokens=1 delims=." %%a in ("!NODE_VERSION!") do set NODE_MAJOR=%%a
    
    if !NODE_MAJOR! geq 18 (
        call :print_success "Node.js version !NODE_VERSION! is compatible"
        set "node_ok=true"
    ) else (
        call :print_error "Node.js version !NODE_VERSION! is too old. Please install Node.js 18 or higher."
        set "node_ok=false"
    )
) else (
    call :print_error "Node.js is not installed. Please install Node.js 18 or higher."
    set "node_ok=false"
)
goto :eof

REM Function to check npm version
:check_npm_version
call :command_exists npm
if "%exists%"=="true" (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    for /f "tokens=1 delims=." %%a in ("!NPM_VERSION!") do set NPM_MAJOR=%%a
    
    if !NPM_MAJOR! geq 8 (
        call :print_success "npm version !NPM_VERSION! is compatible"
        set "npm_ok=true"
    ) else (
        call :print_error "npm version !NPM_VERSION! is too old. Please install npm 8 or higher."
        set "npm_ok=false"
    )
) else (
    call :print_error "npm is not installed. Please install npm 8 or higher."
    set "npm_ok=false"
)
goto :eof

REM Function to check Git
:check_git
call :command_exists git
if "%exists%"=="true" (
    call :print_success "Git is installed"
) else (
    call :print_warning "Git is not installed. Please install Git for version control."
)
goto :eof

REM Function to install backend dependencies
:install_backend
call :print_header "Installing Backend Dependencies"

if not exist "Backend" (
    call :print_error "Backend directory not found!"
    exit /b 1
)

cd Backend

call :print_status "Installing npm packages..."
call npm install

if %errorlevel% equ 0 (
    call :print_success "Backend dependencies installed successfully"
) else (
    call :print_error "Failed to install backend dependencies"
    exit /b 1
)

cd ..
goto :eof

REM Function to install frontend dependencies
:install_frontend
call :print_header "Installing Frontend Dependencies"

if not exist "Frontend" (
    call :print_error "Frontend directory not found!"
    exit /b 1
)

cd Frontend

call :print_status "Installing npm packages..."
call npm install

if %errorlevel% equ 0 (
    call :print_success "Frontend dependencies installed successfully"
) else (
    call :print_error "Failed to install frontend dependencies"
    exit /b 1
)

cd ..
goto :eof

REM Function to setup environment variables
:setup_environment
call :print_header "Setting Up Environment Variables"

cd Backend

if not exist ".env" (
    if exist "env.example" (
        call :print_status "Creating .env file from env.example..."
        copy env.example .env >nul
        call :print_success "Environment file created"
        call :print_warning "Please edit Backend\.env with your configuration"
    ) else (
        call :print_warning "env.example not found. Please create .env file manually"
    )
) else (
    call :print_success "Environment file already exists"
)

cd ..
goto :eof

REM Function to create admin user
:create_admin
call :print_header "Creating Admin User"

cd Backend

if exist "package.json" (
    call :print_status "Creating admin user..."
    call npm run setup
    
    if %errorlevel% equ 0 (
        call :print_success "Admin user created successfully"
        call :print_status "Admin credentials:"
        call :print_status "  Name: Deep"
        call :print_status "  Phone: 7005461841"
    ) else (
        call :print_warning "Failed to create admin user. You can create it manually later."
    )
) else (
    call :print_error "package.json not found in Backend directory"
)

cd ..
goto :eof

REM Function to check MongoDB
:check_mongodb
call :print_header "Checking MongoDB"

call :command_exists mongod
if "%exists%"=="true" (
    call :print_success "MongoDB is installed"
    call :print_status "Make sure MongoDB is running: mongod"
) else (
    call :print_warning "MongoDB is not installed locally"
    call :print_status "For local development, install MongoDB from: https://www.mongodb.com/try/download/community"
    call :print_status "For production, use MongoDB Atlas: https://cloud.mongodb.com"
)
goto :eof

REM Function to display next steps
:show_next_steps
call :print_header "Setup Complete! Next Steps"

echo %CYAN%1. Configure Environment Variables:%NC%
echo    Edit Backend\.env with your configuration
echo.

echo %CYAN%2. Start MongoDB:%NC%
echo    Local: mongod
echo    Atlas: Use connection string in .env
echo.

echo %CYAN%3. Start Development Servers:%NC%
echo    Terminal 1: cd Backend ^&^& npm run dev
echo    Terminal 2: cd Frontend ^&^& npm run dev
echo.

echo %CYAN%4. Access the Application:%NC%
echo    Frontend: http://localhost:5173
echo    Backend: http://localhost:5000
echo.

echo %CYAN%5. Admin Login:%NC%
echo    Name: Deep
echo    Phone: 7005461841
echo.

echo %CYAN%6. Documentation:%NC%
echo    README.md - Main documentation
echo    DEPLOYMENT_GUIDE.md - Deployment instructions
echo    requirements.txt - All requirements
echo.

echo %GREEN%🎉 RealChat2 is ready to use!%NC%
goto :eof

REM Main setup function
:main
call :print_header "RealChat2 Setup Script"
echo.

REM Check prerequisites
call :print_header "Checking Prerequisites"

call :check_node_version
if "%node_ok%"=="false" exit /b 1

call :check_npm_version
if "%npm_ok%"=="false" exit /b 1

call :check_git
call :check_mongodb

echo.

REM Install dependencies
call :install_backend
echo.

call :install_frontend
echo.

REM Setup environment
call :setup_environment
echo.

REM Create admin user
call :create_admin
echo.

REM Show next steps
call :show_next_steps
goto :eof

REM Check if script is run from project root
if not exist "Backend" (
    call :print_error "Please run this script from the RealChat2 project root directory"
    exit /b 1
)

if not exist "Frontend" (
    call :print_error "Please run this script from the RealChat2 project root directory"
    exit /b 1
)

REM Run main function
call :main

pause 