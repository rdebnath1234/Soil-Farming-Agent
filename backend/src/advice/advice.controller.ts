import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { QueryAdviceDto } from './dto/query-advice.dto';
import { AdviceService } from './advice.service';

@Controller('advice')
@UseGuards(JwtAuthGuard)
export class AdviceController {
  constructor(private readonly adviceService: AdviceService) {}

  @Get()
  getAdvice(@Query() query: QueryAdviceDto, @Req() req: AuthenticatedRequest) {
    return this.adviceService.getAdvice(query.pincode, {
      email: req.user.email,
      role: req.user.role,
    });
  }
}
