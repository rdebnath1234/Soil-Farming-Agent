import { Module } from '@nestjs/common';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { AgmarknetController } from './agmarknet.controller';
import { AgmarknetService } from './agmarknet.service';

@Module({
  imports: [ActivityLogsModule],
  controllers: [AgmarknetController],
  providers: [AgmarknetService],
  exports: [AgmarknetService],
})
export class AgmarknetModule {}
