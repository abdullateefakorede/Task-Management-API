import { IsNotEmpty, IsString } from 'class-validator';

export class tokenData {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  id: string;
}
