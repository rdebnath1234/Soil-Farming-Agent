import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AskAiDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsIn(['bn', 'en'])
  answerLanguage?: 'bn' | 'en';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  topK?: number;
}
