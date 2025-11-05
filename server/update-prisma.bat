@echo off
call npx prisma migrate reset --force --skip-seed
call npx prisma migrate dev --name init --skip-seed
call npx prisma generate