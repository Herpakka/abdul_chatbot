import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    username: string;
}