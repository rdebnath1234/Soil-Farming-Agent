import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateKnowledgeDocsDto } from './dto/create-knowledge-doc.dto';
import { AskAiDto } from './dto/ask-ai.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { Role } from '../users/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get('knowledge-docs')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  listKnowledge() {
    return this.aiService.listKnowledge();
  }

  @Post('knowledge-docs')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async ingestKnowledge(
    @Body() docsDto: CreateKnowledgeDocsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.aiService.ingestKnowledge(
      docsDto,
      req.user.email,
    );

    await this.activityLogsService.create({
      action: 'INGEST_KNOWLEDGE',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `Knowledge docs ingested: ${result.count}`,
    });

    return result;
  }

  @Post('ask')
  async ask(@Body() askDto: AskAiDto, @Req() req: AuthenticatedRequest) {
    const result = await this.aiService.askQuestion(askDto);

    await this.activityLogsService.create({
      action: 'AI_QUERY',
      actorEmail: req.user.email,
      actorRole: req.user.role,
      message: `AI query asked: ${askDto.question.slice(0, 80)}`,
    });

    return result;
  }
}
