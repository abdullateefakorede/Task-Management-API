import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { disconnect, Model } from 'mongoose';
import { TaskService } from '../../../src/task/task.service';
import { Task, TaskDocument } from '../../../src/utils/schemas/task.schema';

describe('TaskService', () => {
  let taskService: TaskService;
  let taskModel: Model<TaskDocument>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: Model,
        },
      ],
    }).compile();

    taskService = await app.resolve(TaskService);
    taskModel = await app.resolve(getModelToken(Task.name));
  });
  afterAll(async () => disconnect());

  describe('updateTask', () => {
    beforeEach(() => jest.clearAllMocks());

    it('', async () => {
      const data = {
        name: 'Kobo Test Task',
        completed: true,
      };
      const id = 'yZwvJ';
      const task = {
        _id: '61c75e876fc7779ec8d9fe90',
        userId: 'TY4ht',
        id: 'yZwvJ',
        completed: true,
        createdAt: '25/12/2021, 7:10:15 pm',
        dueAt: '01/12/2021, 2:00:00 pm',
        name: 'Kobo Test Task',
        __v: 0,
      };
      const mockFindOneAndUpdate = jest
        .spyOn(taskModel, 'findOneAndUpdate')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );

      await taskService.updateTask(id, data);

      expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith({ id }, data, {
        new: true,
      });
    });
  });
});
