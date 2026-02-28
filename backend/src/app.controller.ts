import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'Soil Farming Agent API',
      status: 'ok',
      docsHint: 'Use frontend at http://localhost:5173',
    };
  }

  @Get('favicon.ico')
  @HttpCode(204)
  getFavicon() {
    return;
  }
}
