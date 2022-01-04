import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const data = {
    id: expect.any(String),
    token: expect.any(String),
    username: expect.any(String),
  };
  const task = {
    __v: 0,
    _id: expect.any(String),
    completed: expect.any(Boolean),
    createdAt: expect.any(String),
    dueAt: expect.any(String),
    id: expect.any(String),
    name: expect.any(String),
    userId: expect.any(String),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    disconnect();
  });

  describe('signIn', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should signIn with valid details', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/signin')
        .send({ username: '100Kobo2', password: 'Kobo3602019@' })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body.data).toMatchObject(data);
      expect(response.body.data.token).toBeDefined();
      token = response.body.data.token;
    });
  });

  describe('getTasksByUserId', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return user tasks using valid token', async () => {
      const message = 'Tasks Successfully Fetched';
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.body.data).toEqual(expect.arrayContaining([task]));
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse with invalid token', async () => {
      const message = 'Bad/Expired Token';
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set({ Authorization: `Bearer gwff3ytfy53hjvb3vyytv4ejcbyvwefvnmbefv` })
        .expect(401);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });
  });

  describe('getTaskById', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should sendSuccessResponse with task details when taskId is valid', async () => {
      const message = 'Task Successfully Fetched';
      const response = await request(app.getHttpServer())
        .get('/tasks/3yfZ6')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.body.data).toEqual(expect.objectContaining(task));
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse with invalid taskId', async () => {
      const message = 'Invalid Task Id';
      const response = await request(app.getHttpServer())
        .get('/tasks/uKOym')
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse when request is made with invalid token', async () => {
      const message = 'Bad/Expired Token';
      const response = await request(app.getHttpServer())
        .get('/tasks/3yfZ6')
        .set({
          Authorization: `Bearer fgdsghchsdvchsdhvsdvsvhdvhjsdhshsdvhshdsd}`,
        })
        .expect(401);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });
  });

  describe('createTask', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should sendSuccessResponse with only task name', async () => {
      const message = 'Task Successfully Created';
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set({ Authorization: `Bearer ${token}` })
        .send({ name: 'Sample Task' })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.body.data).toEqual(expect.objectContaining(task));
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendSuccessResponse with task name and valid dueAt', async () => {
      const message = 'Task Successfully Created';
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set({ Authorization: `Bearer ${token}` })
        .send({ name: 'Sample Task', dueAt: '03-31-2022' })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.body.data).toEqual(expect.objectContaining(task));
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toStrictEqual(message);
    });

    // it('should sendErrorResponse when request is made with past date', async () => {
    //   const message = 'Bad/Expired Token';
    //   const response = await request(app.getHttpServer())
    //     .post('/tasks')
    //     .set({ Authorization: `Bearer ${token}` })
    //     .send({ name: 'Sample Task', dueAt: '01-31-2019' })
    //   expect(response.body).toBeDefined();
    //   expect(response.body.data).toBeDefined();
    //   expect(response.body.data).toBeNull();
    //   expect(response.body.success).toBeFalsy();
    //   expect(response.body.message).toStrictEqual(message);
    // });

    it('should sendErrorResponse when request body is empty', async () => {
      const message = 'Something went wrong';
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse when request is made with invalid token', async () => {
      const message = 'Bad/Expired Token';
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set({
          Authorization: `Bearer fgdsghchsdvchsdhvsdvsvhdvhjsdhshsdvhshdsd}`,
        })
        .send({ name: 'Sample Task', dueAt: '03-31-2022' })
        .expect(401);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });
  });

  describe('editTask', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should sendSuccessResponse with updatedTask with valid token', async () => {
      const message = 'Task Successfully Updated';
      const response = await request(app.getHttpServer())
        .patch('/tasks/3yfZ6')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.body.data).toEqual(expect.objectContaining(task));
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse making request with invalid taskId', async () => {
      const message = 'Invalid Task Id';
      const response = await request(app.getHttpServer())
        .patch('/tasks/uKOym')
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse for a wrong user edit attempt', async () => {
      const message = 'Not Authorized';
      const response = await request(app.getHttpServer())
        .patch('/tasks/BGIQq')
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse when request is made with invalid token', async () => {
      const message = 'Bad/Expired Token';
      const response = await request(app.getHttpServer())
        .patch('/tasks/3yfZ6')
        .set({
          Authorization: `Bearer fgdsghchsdvchsdhvsdvsvhdvhjsdhshsdvhshdsd}`,
        })
        .expect(401);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should sendErrorResponse making request with invalid taskId', async () => {
      const message = 'Invalid Task Id';
      const response = await request(app.getHttpServer())
        .delete('/tasks/uKOym')
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse for a wrong user delete attempt', async () => {
      const message = 'Not Authorized';
      const response = await request(app.getHttpServer())
        .delete('/tasks/BGIQq')
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse when request is made with invalid token', async () => {
      const message = 'Bad/Expired Token';
      const response = await request(app.getHttpServer())
        .delete('/tasks/zxTRm')
        .set({
          Authorization: `Bearer fgdsghchsdvchsdhvsdvsvhdvhjsdhshsdvhshdsd}`,
        })
        .expect(401);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendSuccessResponse with deleted Task details using valid token', async () => {
      const message = 'Task Successfully Deleted';
      const response = await request(app.getHttpServer())
        .delete('/tasks/zxTRm')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body).toBeDefined();
      expect(response.body.data).toEqual(expect.objectContaining(task));
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toStrictEqual(message);
    });
  });
});
