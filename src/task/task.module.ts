import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from '../config/config';
import { Task, TaskSchema } from '../utils/schemas/task.schema';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    JwtModule.register({ secret: config.secret }),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
