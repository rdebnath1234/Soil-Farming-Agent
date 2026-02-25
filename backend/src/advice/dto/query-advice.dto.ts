import { Matches } from 'class-validator';

export class QueryAdviceDto {
  @Matches(/^\d{6}$/, { message: 'pincode must be a 6 digit number' })
  pincode!: string;
}
