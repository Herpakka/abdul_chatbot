import { IsEmail, IsString, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @IsString()
    @MinLength(8)
    @MaxLength(50)
    username: string;
}