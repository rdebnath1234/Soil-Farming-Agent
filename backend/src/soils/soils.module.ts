import { Module } from '@nestjs/common';
import { SoilsController } from './soils.controller';
import { SoilsService } from './soils.service';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [ActivityLogsModule],
  controllers: [SoilsController],
  providers: [SoilsService],
})
export class SoilsModule {}
