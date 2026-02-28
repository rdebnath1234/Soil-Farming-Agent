import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { Role } from '../users/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('distributors')
export class DistributorsController {
  constructor(
    private readonly distributorsService: DistributorsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.distributorsService.findAll({
      search,
      page: Number(page || 1),
      limit: Number(limit || 6),
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(
    @Body() createDistributorDto: CreateDistributorDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const distributor = await this.distributorsService.create(
      createDistributorDto,
      req.user.email,
    );

    await this.activityLogsService.create({
      action: 'CREATE_DISTRIBUTOR',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Distributor details posted for ${distributor.name}`,
    });

    return distributor;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDistributorDto: UpdateDistributorDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const distributor = await this.distributorsService.update(
      id,
      updateDistributorDto,
    );

    await this.activityLogsService.create({
      action: 'UPDATE_DISTRIBUTOR',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Distributor details updated for ${distributor.name}`,
    });

    return distributor;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const response = await this.distributorsService.remove(id);

    await this.activityLogsService.create({
      action: 'DELETE_DISTRIBUTOR',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Distributor details deleted with id ${id}`,
    });

    return response;
  }
}
