import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { Role } from '../users/role.enum';
import { QueryAgmarknetDto } from './dto/query-agmarknet.dto';
import { AgmarknetService } from './agmarknet.service';

@Controller('agmarknet')
@UseGuards(JwtAuthGuard)
export class AgmarknetController {
  constructor(
    private readonly agmarknetService: AgmarknetService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get('prices')
  async getLivePrices(
    @Query() query: QueryAgmarknetDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.agmarknetService.fetchLive(query);

    await this.activityLogsService.create({
      action: 'AGMARKNET_FETCH',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Agmarknet live fetch: ${result.count} rows`,
    });

    return result;
  }

  @Post('sync')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async syncToDatabase(
    @Query() query: QueryAgmarknetDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.agmarknetService.syncToDb(query);

    await this.activityLogsService.create({
      action: 'AGMARKNET_SYNC',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Agmarknet sync completed: ${result.synced} rows`,
    });

    return result;
  }
}
