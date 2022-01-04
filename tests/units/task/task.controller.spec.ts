import { JwtModule } from '@nestjs/jwt';
import * as responseHelper from '../../../src/helpers/response.helper';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { disconnect, Model } from 'mongoose';
import { config } from '../../../src/config/config';
import {
  Task,
  TaskDocument,
  TaskSchema,
} from '../../../src/utils/schemas/task.schema';
import { TaskController } from '../../../src/task/task.controller';
import { TaskService } from '../../../src/task/task.service';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from '../../../src/task/task.module';
import { UserModule } from '../../../src/user/user.module';
import * as util from '../../../src/utils/common';
import * as queryHelper from '../../../src/helpers/query.helper';

describe('TaskController', () => {
  let taskController: TaskController;
  let taskService: TaskService;
  let taskModel: Model<TaskDocument>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        JwtModule.register({ secret: config.secret }),
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(config.db_uri),
        TaskModule,
        UserModule,
      ],
      controllers: [TaskController],
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: Model,
        },
      ],
    }).compile();

    taskController = await app.resolve(TaskController);
    taskService = await app.resolve(TaskService);
    taskModel = await app.resolve(getModelToken(Task.name));
  });
  afterAll(async () => disconnect());

  describe('getTasksByUserId', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return sendErrorResponse when no task found for the userId', async () => {
      const mockReq = {
        user: {
          id: 'rt54g5',
        },
      };
      const mockRes = {};
      const task = undefined;
      const message = 'No Task Found for the userId';
      const mockFind = jest.spyOn(taskModel, 'find').mockImplementationOnce(
        () =>
          ({
            exec: () => task,
          } as any),
      );
      const returnResponse = {
        data: null,
        message,
        success: false,
      };
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.getTasksByUserId(mockReq, mockRes);

      expect(mockFind).toHaveBeenCalledTimes(1);
      expect(mockFind).toHaveBeenCalledWith({ userId: mockReq.user.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, message);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
    });

    it('should return new sendErrorResponse when catch any error ', async () => {
      const mockReq = {
        user: {
          id: undefined,
        },
      };
      const mockRes = {};
      const error = new Error();
      const mockFind = jest.spyOn(taskModel, 'find').mockImplementationOnce(
        () =>
          ({
            exec: () => {
              throw error;
            },
          } as any),
      );
      const returnResponse = {
        message: 'Something went wrong',
        success: false,
        data: null,
      };
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.getTasksByUserId(mockReq, mockRes);

      expect(mockFind).toHaveBeenCalledTimes(1);
      expect(mockFind).toHaveBeenCalledWith({ userId: mockReq.user.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
      expect(mocksendErrorResponse).toHaveReturnedWith(returnResponse);
    });

    it('should call sendSuccessResponse when request is successful ', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockRes = {};
      const message = 'Tasks Successfully Fetched';
      const tasks = [
        {
          _id: '61c75e876fc7779ec8d9fe90',
          userId: 'TY4ht',
          id: 'yZwvJ',
          completed: false,
          createdAt: '25/12/2021, 7:10:15 pm',
          dueAt: '01/12/2021, 2:00:00 pm',
          name: 'Kobo Test Task',
          __v: 0,
        },
        {
          _id: '61c96ae3b85eca08a52797e3',
          userId: 'TY4ht',
          id: 'QKOym',
          completed: false,
          createdAt: '27/12/2021, 8:27:31 am',
          dueAt: 'NIL',
          name: 'sample task',
          __v: 0,
        },
      ];
      const mockFind = jest.spyOn(taskModel, 'find').mockImplementationOnce(
        () =>
          ({
            exec: () => tasks,
          } as any),
      );
      const returnResponse = {
        data: tasks,
        message,
        success: true,
      };
      const mockSendSuccessResponse = jest
        .spyOn(responseHelper, 'sendSuccessResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.getTasksByUserId(mockReq, mockRes);

      expect(mockFind).toHaveBeenCalledTimes(1);
      expect(mockFind).toHaveBeenCalledWith({ userId: mockReq.user.id });
      expect(mockSendSuccessResponse).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        tasks,
        message,
      );
      expect(mockSendSuccessResponse).toHaveReturnedTimes(1);
      expect(mockSendSuccessResponse).toHaveReturnedWith(returnResponse);
    });
  });

  describe('getTaskById', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return new sendErrorResponse when taskId is invalid', async () => {
      const mockParam = {
        id: 'gYT54',
      };
      const mockRes = {};
      const task = undefined;
      const message = 'Invalid Task Id';
      const returnResponse = {
        data: null,
        message,
        success: false,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.getTaskById(mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, message);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
    });

    it('should return new sendErrorResponse when any error is caught', async () => {
      const mockParam = {
        id: 'gYT54',
      };
      const mockRes = {};
      const error = new Error();
      const returnResponse = {
        data: null,
        message: 'Something went wrong',
        success: false,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => {
                throw error;
              },
            } as any),
        );
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.getTaskById(mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
      expect(mocksendErrorResponse).toHaveReturnedWith(returnResponse);
    });

    it('should call sendSuccessResponse when parameter is valid', async () => {
      const mockParam = {
        id: 'yZwvJ',
      };
      const mockRes = {};
      const message = 'Task Successfully Fetched';
      const task = {
        _id: '61c75e876fc7779ec8d9fe90',
        userId: 'TY4ht',
        id: 'yZwvJ',
        completed: false,
        createdAt: '25/12/2021, 7:10:15 pm',
        dueAt: '01/12/2021, 2:00:00 pm',
        name: 'Kobo Test Task',
        __v: 0,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );
      const returnResponse = {
        data: task,
        message,
        success: true,
      };
      const mockSendSuccessResponse = jest
        .spyOn(responseHelper, 'sendSuccessResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.getTaskById(mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mockSendSuccessResponse).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        task,
        message,
      );
      expect(mockSendSuccessResponse).toHaveReturnedTimes(1);
      expect(mockSendSuccessResponse).toHaveReturnedWith(returnResponse);
    });
  });

  describe('createTask', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should call sendSuccessResponse when only name property is provided in request body', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockBody = {
        name: 'Test Task',
        dueAt: undefined,
      };
      const mockRes = {};
      const createdAt: string = new Date().toLocaleString('en-AU');
      const id: string = 'g9wHJ';
      const newTask = {
        ...mockBody,
        createdAt,
        id,
        userId: mockReq.user.id,
      };
      const message = 'Task Successfully Created';
      const task = {
        _id: '61c75e876fc7779ec8d9fe98',
        userId: mockReq.user.id,
        id,
        completed: false,
        createdAt,
        dueAt: 'NIL',
        name: mockBody.name,
        __v: 0,
      };
      const returnResponse = {
        data: task,
        message,
        success: true,
      };
      const mockGenerateRandomId = jest
        .spyOn(util, 'generateRandomId')
        .mockReturnValue(id);
      const mockCreate = jest
        .spyOn(taskModel, 'create')
        .mockImplementationOnce(() => task);
      const mockSendSuccessResponse = jest
        .spyOn(responseHelper, 'sendSuccessResponse')
        .mockImplementationOnce(() => returnResponse);

      await taskController.createTask(mockReq, mockBody, mockRes);

      expect(mockGenerateRandomId).toHaveBeenCalledTimes(1);
      expect(mockGenerateRandomId).toHaveBeenCalledWith(5);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(newTask);
      expect(mockCreate).toHaveReturnedWith(task);
      expect(mockSendSuccessResponse).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        task,
        message,
      );
      expect(mockSendSuccessResponse).toHaveReturnedTimes(1);
      expect(mockSendSuccessResponse).toHaveReturnedWith(returnResponse);
    });

    it('should call sendSuccessResponse when both name and dueAt is provided', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockBody = {
        name: 'Test Task',
        dueAt: '1/13/2022, 24:00',
      };
      const mockRes = {};
      const createdAt: string = new Date().toLocaleString('en-AU');
      const id: string = 'g9wHJ';
      const newTask = {
        ...mockBody,
        createdAt,
        dueAt: new Date(mockBody.dueAt).toLocaleString('en-AU'),
        id,
        userId: mockReq.user.id,
      };
      const message = 'Task Successfully Created';
      const task = {
        _id: '61c75e876fc7779ec8d9fe98',
        userId: mockReq.user.id,
        id,
        completed: false,
        createdAt,
        dueAt: '14/01/2022, 12:00:00 am',
        name: mockBody.name,
        __v: 0,
      };
      const returnResponse = {
        data: task,
        message,
        success: true,
      };
      const mockGenerateRandomId = jest
        .spyOn(util, 'generateRandomId')
        .mockReturnValue(id);
      const mockCreate = jest
        .spyOn(taskModel, 'create')
        .mockImplementationOnce(() => task);
      const mockSendSuccessResponse = jest
        .spyOn(responseHelper, 'sendSuccessResponse')
        .mockImplementationOnce(() => returnResponse);

      await taskController.createTask(mockReq, mockBody, mockRes);

      expect(mockGenerateRandomId).toHaveBeenCalledTimes(1);
      expect(mockGenerateRandomId).toHaveBeenCalledWith(5);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(newTask);
      expect(mockCreate).toHaveReturnedWith(task);
      expect(mockSendSuccessResponse).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        task,
        message,
      );
      expect(mockSendSuccessResponse).toHaveReturnedTimes(1);
      expect(mockSendSuccessResponse).toHaveReturnedWith(returnResponse);
    });

    it('should return new sendErrorResponse when any error is caught', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockBody = {
        name: 'Tes',
        dueAt: '1/13/2022, 24:00',
      };
      const mockRes = {};
      const createdAt: string = new Date().toLocaleString('en-AU');
      const id: string = 'g9wHJ';
      const newTask = {
        ...mockBody,
        createdAt,
        dueAt: new Date(mockBody.dueAt).toLocaleString('en-AU'),
        id,
        userId: mockReq.user.id,
      };
      const message = 'Task Successfully Created';
      const error = new Error();
      const returnResponse = {
        data: null,
        message,
        success: false,
      };
      const mockGenerateRandomId = jest
        .spyOn(util, 'generateRandomId')
        .mockReturnValue(id);
      const mockCreate = jest
        .spyOn(taskModel, 'create')
        .mockImplementationOnce(() => {
          throw error;
        });
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.createTask(mockReq, mockBody, mockRes);

      expect(mockGenerateRandomId).toHaveBeenCalledTimes(1);
      expect(mockGenerateRandomId).toHaveBeenCalledWith(5);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(newTask);
      expect(mockCreate).toThrowError(expect.any(Error));
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
      expect(mocksendErrorResponse).toHaveReturnedWith(returnResponse);
    });
  });

  describe('editTask', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return sendErrorResponse when no task is found with the paramId', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockRes = {};
      const mockBody = {
        name: 'Kobo Test Task',
        dueAt: undefined,
        completed: false,
      };
      const mockParam = {
        id: 'yZkuJ',
      };
      const task = undefined;
      const message = 'Invalid Task Id';
      const returnResponse = {
        data: null,
        message,
        success: false,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.editTask(mockReq, mockBody, mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, message);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
    });

    it('should return sendErrorResponse when task is found but with unauthorized user', async () => {
      const mockReq = {
        user: {
          id: '3PR97',
        },
      };
      const mockRes = {};
      const mockBody = {
        name: 'Kobo Test Task',
        dueAt: undefined,
        completed: false,
      };
      const mockParam = {
        id: 'yZwvJ',
      };
      const task = {
        _id: '61c75e876fc7779ec8d9fe90',
        userId: 'TY4ht',
        id: 'yZwvJ',
        completed: false,
        createdAt: '25/12/2021, 7:10:15 pm',
        dueAt: '01/12/2021, 2:00:00 pm',
        name: 'Kobo Test Task',
        __v: 0,
      };
      const message = 'Not Authorized';
      const returnResponse = {
        data: null,
        message,
        success: false,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.editTask(mockReq, mockBody, mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, message);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
    });

    it('should return new sendErrorResponse when any error is caught', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockRes = {};
      const mockBody = {
        name: 'Kobo Test Task',
        dueAt: undefined,
        completed: false,
      };
      const mockParam = {
        id: 'yZkuJ',
      };
      const error = new Error();
      const returnResponse = {
        data: null,
        message: 'Something went wrong',
        success: false,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => {
                throw error;
              },
            } as any),
        );
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.editTask(mockReq, mockBody, mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
    });

    it('should call sendSuccessResponse when taskId and request body is valid with authorized user', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockRes = {};
      const mockBody = {
        name: 'Kobo Test Task',
        dueAt: undefined,
        completed: true,
      };
      const mockParam = {
        id: 'yZwvJ',
      };
      const data = {
        name: 'Kobo Test Task',
        completed: true,
      };
      const message = 'Task Successfully Updated';
      const task = {
        _id: '61c75e876fc7779ec8d9fe90',
        userId: 'TY4ht',
        id: 'yZwvJ',
        completed: false,
        createdAt: '25/12/2021, 7:10:15 pm',
        dueAt: '01/12/2021, 2:00:00 pm',
        name: 'Kobo Test Task',
        __v: 0,
      };
      const updatedTask = {
        _id: '61c75e876fc7779ec8d9fe90',
        userId: 'TY4ht',
        id: 'yZwvJ',
        completed: true,
        createdAt: '25/12/2021, 7:10:15 pm',
        dueAt: '01/12/2021, 2:00:00 pm',
        name: 'Kobo Test Task',
        __v: 0,
      };
      const returnResponse = {
        data: updatedTask,
        message,
        success: true,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );
      const mockRequestFilter = jest
        .spyOn(queryHelper, 'requestFilter')
        .mockImplementationOnce(() => data);
      const mockUpdateTask = jest
        .spyOn(taskService, 'updateTask')
        .mockImplementationOnce(() => updatedTask as any);
      const mockSendSuccessResponse = jest
        .spyOn(responseHelper, 'sendSuccessResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.editTask(mockReq, mockBody, mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mockRequestFilter).toHaveBeenCalledTimes(1);
      expect(mockRequestFilter).toHaveBeenCalledWith(mockBody);
      expect(mockRequestFilter).toHaveReturnedWith(data);
      expect(mockUpdateTask).toHaveBeenCalledTimes(1);
      expect(mockUpdateTask).toHaveBeenCalledWith(mockParam.id, data);
      expect(mockUpdateTask).toHaveReturnedWith(updatedTask);
      expect(mockSendSuccessResponse).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        updatedTask,
        message,
      );
      expect(mockSendSuccessResponse).toHaveReturnedTimes(1);
      expect(mockSendSuccessResponse).toHaveReturnedWith(returnResponse);
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return sendErrorResponse when no task is found with the paramId', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockRes = {};
      const mockParam = {
        id: 'yZkuJ',
      };
      const task = undefined;
      const message = 'Invalid Task Id';
      const returnResponse = {
        data: null,
        message,
        success: false,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.deleteTask(mockReq, mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, message);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
    });

    it('should return sendErrorResponse when task is found but with unauthorized user', async () => {
      const mockReq = {
        user: {
          id: '3PR97',
        },
      };
      const mockRes = {};
      const mockParam = {
        id: 'yZwvJ',
      };
      const task = {
        _id: '61c75e876fc7779ec8d9fe90',
        userId: 'TY4ht',
        id: 'yZwvJ',
        completed: false,
        createdAt: '25/12/2021, 7:10:15 pm',
        dueAt: '01/12/2021, 2:00:00 pm',
        name: 'Kobo Test Task',
        __v: 0,
      };
      const message = 'Not Authorized';
      const returnResponse = {
        data: null,
        message,
        success: false,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.deleteTask(mockReq, mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, message);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
    });

    it('should return new sendErrorResponse when any error is caught', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockRes = {};
      const mockParam = {
        id: 'yZkuJ',
      };
      const error = new Error();
      const returnResponse = {
        data: null,
        message: 'Something went wrong',
        success: false,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => {
                throw error;
              },
            } as any),
        );
      const mocksendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.deleteTask(mockReq, mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mocksendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mocksendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mocksendErrorResponse).toHaveReturnedTimes(1);
    });

    it('should call sendSuccessResponse when taskId is valid with authorized user', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockRes = {};
      const mockParam = {
        id: 'yZwvJ',
      };
      const message = 'Task Successfully Deleted';
      const task = new taskModel({
        _id: '61c75e876fc7779ec8d9fe90',
        userId: 'TY4ht',
        id: 'yZwvJ',
        completed: false,
        createdAt: '25/12/2021, 7:10:15 pm',
        dueAt: '01/12/2021, 2:00:00 pm',
        name: 'Kobo Test Task',
        __v: 0,
      });
      const returnResponse = {
        data: task,
        message,
        success: true,
      };
      const mockFindOne = jest
        .spyOn(taskModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => task,
            } as any),
        );
      const mockDeleteOne = jest
        .spyOn(task, 'deleteOne')
        .mockImplementationOnce(() => {});
      const mockSendSuccessResponse = jest
        .spyOn(responseHelper, 'sendSuccessResponse')
        .mockImplementationOnce(() => returnResponse as any);

      await taskController.deleteTask(mockReq, mockParam, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ id: mockParam.id });
      expect(mockDeleteOne).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        task,
        message,
      );
      expect(mockSendSuccessResponse).toHaveReturnedTimes(1);
      expect(mockSendSuccessResponse).toHaveReturnedWith(returnResponse);
    });
  });
});
