import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { disconnect } from 'mongoose';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const data = {
    id: expect.any(String),
    token: expect.any(String),
    username: expect.any(String),
  };
  const signUpData = {
    id: expect.any(String),
    nationality: expect.any(String),
    birthdate: expect.any(String),
    name: expect.any(String),
    password: expect.any(String),
    username: expect.any(String),
    _id: expect.any(String),
    __v: expect.any(Number),
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

    it('should signIn and sendSucessResponse with valid details', async () => {
      const message = 'SIGN_IN_SUCCESSFUL';
      const response = await request(app.getHttpServer())
        .post('/user/signin')
        .send({ username: '100Kobo2', password: 'Kobo3602019@' })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body.data).toMatchObject(data);
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toStrictEqual(message);
      expect(response.body.data.token).toBeDefined();
      token = response.body.data.token;
    });

    it("should sendErrorResponse with username and password doesn't match", async () => {
      const message = 'INVALID_USERNAME_OR_PASSWORD';
      const response = await request(app.getHttpServer())
        .post('/user/signin')
        .send({ username: '100Kobo2', password: 'Kobo36029@' })
        .expect(400);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });
  });

  describe('signUp', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should signUp and sendSuceessResponse with valid request payloads', async () => {
      const message = 'SIGN_UP_SUCCESSFUL';
      const response = await request(app.getHttpServer())
        .post('/user/signup')
        .send({
          username: '50Kobo',
          password: 'Kobo3602019@',
          name: 'Kobo',
          birthdate: '12-1-2010',
          nationality: 'Nigerian',
        })
        .expect(200);
      expect(response.body).toBeDefined();
      expect(response.body.data).toEqual(expect.objectContaining(signUpData));
      expect(response.body.success).toBeTruthy();
      expect(response.body.message).toStrictEqual(message);
    });

    it('should sendErrorResponse when making request with already existing user', async () => {
      const message = 'USER_ALREADY_EXIST';
      const response = await request(app.getHttpServer())
        .post('/user/signup')
        .send({
          username: '100Kobo',
          password: 'Kobo3602019@',
          name: 'Kobo',
          birthdate: '12-1-2010',
          nationality: 'Nigerian',
        })
        .expect(400);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeNull();
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toStrictEqual(message);
    });
  });
});
