import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(['pending', 'complete'])
  status?: 'pending' | 'complete';

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
