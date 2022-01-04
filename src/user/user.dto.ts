import { Type } from "class-transformer";
import { IsString, MinLength, IsAlpha, IsDate, MaxDate, } from "class-validator";
const minYear = new Date().getFullYear() - 10;

export class UserSignUp {
  @IsString()
  @MinLength(5)
  username: string;

  @IsString()
  @MinLength(7)
  password: string;

  @IsString()
  @MinLength(3)
  @IsAlpha()
  name: string;

  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date(`01-01-${minYear}`))
  birthdate: Date;

  @IsString()
  @MinLength(3)
  nationality: string;

}

export class signIn {
  @IsString()
  @MinLength(5)
  username: string;

  @IsString()
  @MinLength(5)
  password: string;
}
