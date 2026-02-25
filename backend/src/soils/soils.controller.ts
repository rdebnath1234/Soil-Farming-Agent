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
import { SoilsService } from './soils.service';
import { CreateSoilDto } from './dto/create-soil.dto';
import { UpdateSoilDto } from './dto/update-soil.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('soils')
export class SoilsController {
  constructor(
    private readonly soilsService: SoilsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.soilsService.findAll({
      search,
      page: Number(page || 1),
      limit: Number(limit || 6),
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createSoilDto: CreateSoilDto, @Req() req: any) {
    const soil = await this.soilsService.create(createSoilDto, req.user.email);
    await this.activityLogsService.create({
      action: 'CREATE_SOIL',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Soil details posted for ${soil.soilType}`,
    });
    return soil;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSoilDto: UpdateSoilDto,
    @Req() req: any,
  ) {
    const soil = await this.soilsService.update(id, updateSoilDto);
    await this.activityLogsService.create({
      action: 'UPDATE_SOIL',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Soil details updated for ${soil.soilType}`,
    });
    return soil;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const response = await this.soilsService.remove(id);
    await this.activityLogsService.create({
      action: 'DELETE_SOIL',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Soil details deleted with id ${id}`,
    });
    return response;
  }
}
