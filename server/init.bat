@echo off
setlocal enabledelayedexpansion enableextensions
title NestJS Auth Project Setup

:: ============================================================
:: Configuration and Constants
:: ============================================================
set "SCRIPT_NAME=NestJS Auth Setup"
set "NEST_CMD="

echo.
echo ============================================================
echo %SCRIPT_NAME% - Starting...
echo ============================================================
echo.

:: ============================================================
:: Step 1: Verify Prerequisites and Initialize Project
:: ============================================================
echo [INFO] Checking prerequisites...

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is required but not found in PATH
    goto :error_exit
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is required but not found in PATH
    goto :error_exit
)

echo [SUCCESS] Node.js and npm found

:: Initialize package.json if not exists
if not exist package.json (
    echo [INFO] Initializing Node.js project...
    call npm init -y
    if errorlevel 1 (
        echo [ERROR] Failed to initialize package.json
        goto :error_exit
    )
)

echo [INFO] Installing dependencies...

:: Group related packages for faster installation
echo [INFO] Installing core dependencies...
call npm install @nestjs/passport @nestjs/jwt @nestjs/config passport passport-local passport-jwt bcrypt @prisma/client prisma class-validator class-transformer
if errorlevel 1 (
    echo [ERROR] Core dependency installation failed
    goto :error_exit
)

echo [INFO] Installing dev dependencies...
call npm install -D @types/passport-local @types/passport-jwt @types/bcrypt
if errorlevel 1 (
    echo [ERROR] Dev dependency installation failed
    goto :error_exit
)

echo [SUCCESS] All dependencies installed

:: ============================================================
:: Step 2: Setup Prisma
:: ============================================================
echo.
echo [INFO] Setting up Prisma...

:: Initialize Prisma if not already done
if not exist "prisma\schema.prisma" (
    call npx prisma init
    if errorlevel 1 (
        echo [ERROR] Prisma initialization failed
        goto :error_exit
    )
)

:: Create .env file with all required variables
echo [INFO] Creating .env configuration...
(
echo DATABASE_URL="postgresql://admin:password@localhost:5439/postgres?schema=passprism"
echo JWT_SECRET="Ccn6zSbtHDEs"
echo JWT_REFRESH_SECRET="rWNaTZ38xajB"
echo JWT_EXPIRES="15m"
echo JWT_REFRESH_EXPIRES="7d"
) > .env

if errorlevel 1 (
    echo [ERROR] Failed to create .env file
    goto :error_exit
)

:: Copy schema file if it exists, otherwise create basic schema
if exist "user.model.txt" (
    echo [INFO] Using provided schema file...
    copy /Y user.model.txt prisma\schema.prisma >nul
) else (
    echo [INFO] Creating default Prisma schema...
    (
echo generator client {
echo   provider = "prisma-client-js"
echo }
echo.
echo datasource db {
echo   provider = "postgresql"
echo   url      = env("DATABASE_URL"^)
echo }
echo.
echo model User {
echo   id        Int      @id @default(autoincrement(^)^)
echo   email     String   @unique
echo   password  String
echo   createdAt DateTime @default(now(^)^)
echo   updatedAt DateTime @updatedAt
echo }
    ) > prisma\schema.prisma
)

echo [INFO] Running Prisma migrations...
call npx prisma migrate reset --force --skip-seed
if errorlevel 1 (
    echo [ERROR] Database reset failed - check PostgreSQL connection at localhost:5439
    goto :error_exit
)

call npx prisma migrate dev --name init --skip-seed
if errorlevel 1 (
    echo [ERROR] Migration failed - verify database connection and schema
    goto :error_exit
)

call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Prisma client generation failed
    goto :error_exit
)

echo [SUCCESS] Prisma setup completed

:: ============================================================
:: Step 3: Setup NestJS CLI and Generate Project Structure
:: ============================================================
echo.
echo [INFO] Setting up Nest CLI...

where nest >nul 2>&1
if not errorlevel 1 (
    set "NEST_CMD=nest"
    echo [INFO] Using global Nest CLI
) else (
    echo [INFO] Installing Nest CLI locally...
    call npm install -D @nestjs/cli
    if errorlevel 1 (
        echo [ERROR] Failed to install @nestjs/cli
        goto :error_exit
    )
    set "NEST_CMD=npx nest"
    echo [SUCCESS] Nest CLI installed locally
)

echo [INFO] Creating project structure...

:: Create all directories
for %%d in (
    "src"
    "src\auth"
    "src\auth\dto"
    "src\auth\guards"
    "src\auth\strategies"
    "src\prisma"
    "src\common"
    "src\common\decorators"
) do (
    if not exist %%d mkdir %%d
)



echo [INFO] Generating NestJS modules and components...

:: Generate modules (suppress warnings for existing modules)
%NEST_CMD% g mo prisma -p src --no-spec >nul 2>&1
call nest g module prisma
%NEST_CMD% g mo auth -p src --no-spec >nul 2>&1
call nest g module auth

:: Generate services and controllers
%NEST_CMD% g s prisma -p src --no-spec >nul 2>&1
call nest g service prisma
%NEST_CMD% g s auth -p src --no-spec >nul 2>&1
call nest g service auth
%NEST_CMD% g co auth -p src --no-spec >nul 2>&1
call nest g controller auth

:: Generate guards
%NEST_CMD% g gu auth/guards/jwt-auth -p src --no-spec >nul 2>&1
%NEST_CMD% g gu auth/guards/local-auth -p src --no-spec >nul 2>&1

:: Generate app controller if missing
if not exist src\app.controller.ts (
    %NEST_CMD% g co app -p src --no-spec >nul 2>&1
)

echo [SUCCESS] NestJS components generated

:create_strategy_templates
call :log_info "Creating strategy and decorator templates..."

:: JWT Strategy template
if not exist src\auth\strategies\jwt.strategy.ts (
(
echo import { Injectable } from '@nestjs/common';
echo import { PassportStrategy } from '@nestjs/passport';
echo import { Strategy, ExtractJwt } from 'passport-jwt';
echo.
echo @Injectable(^)
echo export class JwtStrategy extends PassportStrategy(Strategy^) {
echo   constructor(^) {
echo     super({
echo       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(^),
echo       ignoreExpiration: false,
echo       secretOrKey: process.env.JWT_SECRET,
echo     }^);
echo   }
echo.
echo   async validate(payload: any^) {
echo     return { userId: payload.sub, email: payload.email };
echo   }
echo }
) > src\auth\strategies\jwt.strategy.ts
)

:: Local Strategy template
if not exist src\auth\strategies\local.strategy.ts (
(
echo import { Injectable } from '@nestjs/common';
echo import { PassportStrategy } from '@nestjs/passport';
echo import { Strategy } from 'passport-local';
echo.
echo @Injectable(^)
echo export class LocalStrategy extends PassportStrategy(Strategy^) {
echo   constructor(^) {
echo     super({
echo       usernameField: 'email',
echo     }^);
echo   }
echo.
echo   async validate(email: string, password: string^): Promise^<any^> {
echo     // TODO: Implement user validation logic
echo     return null;
echo   }
echo }
) > src\auth\strategies\local.strategy.ts
)

:: Public decorator
if not exist src\common\decorators\public.decorator.ts (
(
echo import { SetMetadata } from '@nestjs/common';
echo.
echo export const IS_PUBLIC_KEY = 'isPublic';
echo export const Public = (^) =^> SetMetadata(IS_PUBLIC_KEY, true^);
) > src\common\decorators\public.decorator.ts
)

call :log_success "Template files created"
exit /b 0

:show_completion_summary
echo.
echo ============================================================
echo %SCRIPT_NAME% - COMPLETED SUCCESSFULLY
echo ============================================================
echo.
echo ✓ Dependencies installed (NestJS, Passport, Prisma, JWT, bcrypt)
echo ✓ Prisma initialized with database schema
echo ✓ Environment variables configured
echo ✓ Database migrated and Prisma client generated
echo ✓ NestJS modules, services, and controllers scaffolded
echo ✓ Authentication strategy templates created
echo.
echo NEXT STEPS:
echo 1. Ensure PostgreSQL is running on localhost:5439
echo 2. Implement authentication logic in src\auth\auth.service.ts
echo 3. Complete strategy implementations in src\auth\strategies\
echo 4. Configure guards in src\auth\guards\
echo 5. Add DTOs for login/register in src\auth\dto\
echo.
echo Project structure ready for development!
echo ============================================================
exit /b 0

:: ============================================================
:: Main Execution Flow
:: ============================================================
:main
call :log_info "Starting %SCRIPT_NAME%..."

:: Verify Node.js is available
call :check_command node
if errorlevel 1 (
    call :log_error "Node.js is required but not found"
    exit /b 1
)

call :check_command npm
if errorlevel 1 (
    call :log_error "npm is required but not found"
    exit /b 1
)

:: Initialize package.json if not exists
if not exist package.json (
    call :log_info "Initializing Node.js project..."
    call npm init -y --silent
)

:: Execute main setup steps
call :install_dependencies
if errorlevel 1 exit /b 1

call :setup_prisma
if errorlevel 1 exit /b 1

call :setup_nest_cli
if errorlevel 1 exit /b 1

call :create_directories
if errorlevel 1 exit /b 1

call :generate_modules
if errorlevel 1 exit /b 1

call :create_strategy_templates
if errorlevel 1 exit /b 1

call :show_completion_summary
exit /b 0

:: ============================================================
:: Script Entry Point
:: ============================================================
call :main
set ERROR_CODE=%errorlevel%

if %ERROR_CODE% neq 0 (
    echo.
    call :log_error "Setup failed with error code %ERROR_CODE%"
    echo Please check the output above for details.
    pause
    exit /b %ERROR_CODE%
)

echo.
echo Press any key to exit...
pause >nul
exit /b 0