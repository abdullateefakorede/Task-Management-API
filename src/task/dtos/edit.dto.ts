import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinDate,
} from 'class-validator';

export class EditTask {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date())
  dueAt: string;

  @IsOptional()
  @IsBoolean()
  completed: boolean;
}
