import { IsString } from 'class-validator';

export class CreateSoilDto {
  @IsString()
  soilType: string;

  @IsString()
  phRange: string;

  @IsString()
  suitableCrops: string;

  @IsString()
  nutrients: string;

  @IsString()
  irrigationTips: string;
}
