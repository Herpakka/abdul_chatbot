@echo off
call nest g module auth --no-spec
call nest g service auth
call nest g controller auth

call nest g service prisma --no-spec