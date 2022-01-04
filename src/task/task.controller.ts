import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { requestFilter } from '../helpers/query.helper';
import {
  sendSuccessResponse,
  sendErrorResponse,
} from '../helpers/response.helper';
import { generateRandomId } from '../utils/common';
import { Task, TaskDocument } from '../utils/schemas/task.schema';
import { ErrorResponse } from '../helpers/response/error';
import { EditTask } from './dtos/edit.dto';
import { CreateTask } from './dtos/task.dto';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  @Get()
  async getTasksByUserId(@Req() req, @Res() res): Promise<object | string> {
    try {
      const tasks = await this.taskModel.find({ userId: req.user.id }).exec();
      if (!tasks) {
        return sendErrorResponse(res, 'No Task Found for the userId');
      }
      return sendSuccessResponse(res, tasks, 'Tasks Successfully Fetched');
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  @Get('/:id')
  async getTaskById(@Param() param, @Res() res): Promise<object | string> {
    try {
      const task = await this.taskModel.findOne({ id: param.id }).exec();
      if (!task) {
        return sendErrorResponse(res, 'Invalid Task Id')
      }
      return sendSuccessResponse(res, task, 'Task Successfully Fetched');
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  @Post()
  async createTask(
    @Req() req,
    @Body() body: CreateTask,
    @Res() res,
  ): Promise<object | string> {
    try {
      const id: string = generateRandomId(5);
      const createdAt: string = new Date().toLocaleString('en-AU');
      if (body.dueAt) {
        Object.assign(body, {
          dueAt: new Date(body.dueAt).toLocaleString('en-AU'),
        });
      }
      const newTask = {
        ...body,
        createdAt,
        id,
        userId: req.user.id,
      };
      const task = await this.taskModel.create(newTask);
      return sendSuccessResponse(res, task, 'Task Successfully Created');
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  @Patch('/:id')
  async editTask(
    @Req() req,
    @Body() body: EditTask,
    @Param() param,
    @Res() res,
  ): Promise<object | string> {
    try {
      const task = await this.taskModel.findOne({ id: param.id }).exec();
      if (!task) {
        return sendErrorResponse(res, 'Invalid Task Id');
      }
      if (task.userId !== req.user.id) {
        return sendErrorResponse(res, 'Not Authorized')
      }
      const data = requestFilter(body);
      const updatedTask = await this.taskService.updateTask(param.id, data);
      return sendSuccessResponse(res, updatedTask, 'Task Successfully Updated');
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
  @Delete('/:id')
  async deleteTask(
    @Req() req,
    @Param() param,
    @Res() res,
  ): Promise<object | string> {
    try {
      const task = await this.taskModel.findOne({ id: param.id }).exec();
      if (!task) {
        return sendErrorResponse(res, 'Invalid Task Id')
      }
      if (task.userId !== req.user.id) {
        return sendErrorResponse(res, 'Not Authorized');
      }
      await task.deleteOne();
      return sendSuccessResponse(res, task, 'Task Successfully Deleted');
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}
