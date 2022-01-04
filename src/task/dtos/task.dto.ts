import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, MinDate } from 'class-validator';

export class CreateTask {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date())
  dueAt: string;
}
