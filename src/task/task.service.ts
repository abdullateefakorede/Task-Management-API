import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../utils/schemas/task.schema';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async updateTask(id, data): Promise<Task> {
    return await this.taskModel
      .findOneAndUpdate({ id }, data, { new: true })
      .exec();
  }
}
