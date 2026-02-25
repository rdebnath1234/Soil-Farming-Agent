import { IsEmail, IsString } from 'class-validator';

export class CreateDistributorDto {
  @IsString()
  name: string;

  @IsString()
  contactPerson: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;

  @IsString()
  seedsAvailable: string;
}
