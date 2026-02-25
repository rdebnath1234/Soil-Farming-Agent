import { PartialType } from '@nestjs/mapped-types';
import { CreateSoilDto } from './create-soil.dto';

export class UpdateSoilDto extends PartialType(CreateSoilDto) {}
