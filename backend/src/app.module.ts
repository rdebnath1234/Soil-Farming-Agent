import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SoilsModule } from './soils/soils.module';
import { DistributorsModule } from './distributors/distributors.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { AppController } from './app.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { AiModule } from './ai/ai.module';
import { AgmarknetModule } from './agmarknet/agmarknet.module';
import { AdviceModule } from './advice/advice.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    UsersModule,
    AuthModule,
    SoilsModule,
    DistributorsModule,
    ActivityLogsModule,
    AiModule,
    AgmarknetModule,
    AdviceModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
