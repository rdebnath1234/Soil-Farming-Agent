import { Module } from '@nestjs/common';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { AgmarknetModule } from '../agmarknet/agmarknet.module';
import { AdviceController } from './advice.controller';
import { AdviceService } from './advice.service';
import { AdviceMandiService } from './mandi.service';
import { PincodeService } from './pincode.service';
import { AdviceSoilService } from './soil.service';

@Module({
  imports: [AgmarknetModule, ActivityLogsModule],
  controllers: [AdviceController],
  providers: [AdviceService, PincodeService, AdviceSoilService, AdviceMandiService],
})
export class AdviceModule {}
