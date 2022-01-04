import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/config';
import { AuthMiddleware } from './middlewares/authenticate.middleware';
import LoggerMiddleware from './middlewares/logger.middleware';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(config.db_uri),
    JwtModule.register({ secret: config.secret }),
    TaskModule,
    UserModule,
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthMiddleware).forRoutes('tasks')
      consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
