import { Transform, type TransformFnParams } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const trimString = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

const toNumber = ({ value }: TransformFnParams): number | undefined =>
  value === undefined ? undefined : Number(value);

export class QueryAgmarknetDto {
  @IsOptional()
  @IsString()
  @Transform(trimString)
  state?: string;

  @IsOptional()
  @IsString()
  @Transform(trimString)
  district?: string;

  @IsOptional()
  @IsString()
  @Transform(trimString)
  market?: string;

  @IsOptional()
  @IsString()
  @Transform(trimString)
  commodity?: string;

  @IsOptional()
  @IsString()
  @Transform(trimString)
  arrivalDate?: string;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(0)
  @Max(5000)
  offset?: number;
}
