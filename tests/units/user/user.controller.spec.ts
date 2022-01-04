import { ConfigModule } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { disconnect, Model } from 'mongoose';
import { config } from '../../../src/config/config';
import { UserController } from '../../../src/user/user.controller';
import { UserModule } from '../../../src/user/user.module';
import { UserService } from '../../../src/user/user.service';
import {
  User,
  UserDocument,
  UserSchema,
} from '../../../src/utils/schemas/user.schema';
import * as responseHelper from '../../../src/helpers/response.helper';
import * as utils from '../../../src/utils/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({ secret: config.secret }),
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(config.db_uri),
        UserModule,
      ],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
      ],
    }).compile();
    userController = await app.resolve(UserController);
    userService = await app.resolve(UserService);
    userModel = await app.resolve(getModelToken(User.name));
  });
  afterAll(async () => disconnect());

  describe('signin', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should call sendSuccessResponse when request is successful with valid payload', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockBody = {
        username: '100Kobo2',
        password: 'Kobo3602019@',
      };
      const token =
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlRZNGh0IiwidXNlcm5hbWUiOiIxMDBLb2JvMiIsImlhdCI6MTY0MDgwNzk2NX0.Fe-gx6lPhNEgkZ-Hb1N6iUV8t72msWiT_qnPHg6h36I';
      const mockRes = {};
      const response = {
        id: mockReq.user.id,
        username: '100Kobo2',
        token,
      };
      const message = 'SIGN_IN_SUCCESSFUL';
      const user = new userModel({
        id: mockReq.user.id,
        username: mockBody.username,
        password: 'fgsvf326fegv264vffbh24f84f2ywhf2478f4f8',
      });
      const userData = { id: user.id, username: user.username };
      const mockCompare = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => true);
      const mockFindOne = jest
        .spyOn(userModel, 'findOne')
        .mockImplementationOnce(() => ({ exec: () => user } as any));
      const mockGenerateToken = jest
        .spyOn(userService, 'generateToken')
        .mockImplementationOnce(() => token);
      const mockSendSuccessResponse = jest
        .spyOn(responseHelper, 'sendSuccessResponse')
        .mockImplementationOnce(() => response);

      await userController.signIn(mockReq, mockBody, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ username: mockBody.username });
      expect(mockCompare).toHaveBeenCalledTimes(1);
      expect(mockCompare).toHaveBeenCalledWith(
        mockBody.password,
        user.password,
      );
      expect(mockGenerateToken).toHaveBeenCalledTimes(1);
      expect(mockGenerateToken).toHaveBeenCalledWith(userData);
      expect(mockSendSuccessResponse).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        { ...userData, token },
        message,
      );
      expect(mockSendSuccessResponse).toHaveReturnedWith(response);
    });
    it("should call sendErrorResponse when username and password doesn't match", async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockBody = {
        username: '100Kobo2',
        password: 'Kobo3602019',
      };
      const mockRes = {};
      const error = 'INVALID_USERNAME_OR_PASSWORD';
      const response = {
        success: false,
        message: error,
        data: null,
      };
      const user = new userModel({
        id: mockReq.user.id,
        username: mockBody.username,
        password: 'fgsvf326fegv264vffbh24f84f2ywhf2478f4f8',
      });
      const mockCompare = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => false);
      const mockFindOne = jest
        .spyOn(userModel, 'findOne')
        .mockImplementationOnce(() => ({ exec: () => user } as any));
      const mockSendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => response);

      await userController.signIn(mockReq, mockBody, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ username: mockBody.username });
      expect(mockCompare).toHaveBeenCalledTimes(1);
      expect(mockCompare).toHaveBeenCalledWith(
        mockBody.password,
        user.password,
      );
      expect(mockSendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mockSendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mockSendErrorResponse).toHaveReturnedWith(response);
    });
    it('should call sendErrorResponse when any error is caught', async () => {
      const mockReq = {
        user: {
          id: 'TY4ht',
        },
      };
      const mockBody = {
        username: '100Kobo2',
        password: 'Kobo3602019',
      };
      const mockRes = {};
      const error = new Error();
      const response = {
        success: false,
        message: error,
        data: null,
      };
      const user = new userModel({
        id: mockReq.user.id,
        username: mockBody.username,
        password: 'fgsvf326fegv264vffbh24f84f2ywhf2478f4f8',
      });
      const mockCompare = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => {
          throw error;
        });
      const mockFindOne = jest
        .spyOn(userModel, 'findOne')
        .mockImplementationOnce(() => ({ exec: () => user } as any));
      const mockSendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => response);

      await userController.signIn(mockReq, mockBody, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ username: mockBody.username });
      expect(mockCompare).toHaveBeenCalledTimes(1);
      expect(mockCompare).toHaveBeenCalledWith(
        mockBody.password,
        user.password,
      );
      expect(mockSendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mockSendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mockSendErrorResponse).toHaveReturnedWith(response);
    });
  });

  describe('signUp', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should call sendSuccessResponse when request is successful with valid payload', async () => {
      const mockBody: any = {
        username: 'Kobo245',
        password: 'Kobo2452019@',
        name: 'Kobo',
        birthdate: '12-1-2009',
        nationality: 'Ghana',
      };
      const mockRes = {};
      const id = 'ge6Eh';
      const message = 'SIGN_UP_SUCCESSFUL';
      const user = undefined;
      const hashedPassword =
        'd67d3dty327fd37rcvr2366fcuy2q78dbhdchdshajcbdfvcyvgcscsfb';
      const response = {
        id,
        nationality: mockBody.nationality,
        birthdate: mockBody.birthdate,
        name: mockBody.name,
        password: hashedPassword,
        username: mockBody.username,
        _id: '61d436b33ac564b93b797561',
        __v: 0,
      };
      const newUser = {
        ...mockBody,
        password: hashedPassword,
        id,
      };
      const userData = new User();
      const mockFindOne = jest
        .spyOn(userModel, 'findOne')
        .mockImplementationOnce(() => ({ exec: () => user } as any));
      const mockGenerateRandomId = jest
        .spyOn(utils, 'generateRandomId')
        .mockImplementationOnce(() => id);
      const mockHashPassword = jest
        .spyOn(userService, 'hashPassword')
        .mockImplementationOnce(() => hashedPassword as any);
      const mockCreate = jest
        .spyOn(userModel, 'create')
        .mockImplementationOnce(() => userData);
      const mockSendSuccessResponse = jest
        .spyOn(responseHelper, 'sendSuccessResponse')
        .mockImplementationOnce(() => response);

      await userController.signUp(mockBody, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ username: mockBody.username });
      expect(mockGenerateRandomId).toHaveBeenCalledTimes(1);
      expect(mockGenerateRandomId).toHaveBeenCalledWith(5);
      expect(mockHashPassword).toHaveBeenCalledTimes(1);
      expect(mockHashPassword).toHaveBeenCalledWith(mockBody.password, 9);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(newUser);
      expect(mockSendSuccessResponse).toHaveBeenCalledTimes(1);
      expect(mockSendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        userData,
        message,
      );
      expect(mockSendSuccessResponse).toHaveReturnedWith(response);
    });
    it('should call sendErrorResponse when user already exist', async () => {
      const mockBody: any = {
        username: '100Kobo2',
        password: 'Kobo3602019@',
        name: 'Kobo',
        birthdate: '12-1-2009',
        nationality: 'Ghana',
      };
      const mockRes = {};
      const error = 'USER_ALREADY_EXIST';
      const response = {
        success: false,
        message: error,
        data: null,
      };
      const user = new userModel();
      const mockFindOne = jest
        .spyOn(userModel, 'findOne')
        .mockImplementationOnce(() => ({ exec: () => user } as any));
      const mockSendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => response as any);

      await userController.signUp(mockBody, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ username: mockBody.username });
      expect(mockSendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mockSendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mockSendErrorResponse).toHaveReturnedWith(response);
    });
    it('should call sendErrorResponse when any error is caught', async () => {
      const mockBody: any = {
        username: '100Kobo236',
        password: 'Kobo3602019@',
        name: 'Kobo',
        birthdate: '12-1-2009',
        nationality: 'Ghana',
      };
      const mockRes = {};
      const error = new Error();
      const response = {
        success: false,
        message: 'Something went wrong',
        data: null,
      };
      const mockFindOne = jest
        .spyOn(userModel, 'findOne')
        .mockImplementationOnce(
          () =>
            ({
              exec: () => {
                throw error;
              },
            } as any),
        );
      const mockSendErrorResponse = jest
        .spyOn(responseHelper, 'sendErrorResponse')
        .mockImplementationOnce(() => response as any);

      await userController.signUp(mockBody, mockRes);

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ username: mockBody.username });
      expect(mockSendErrorResponse).toHaveBeenCalledTimes(1);
      expect(mockSendErrorResponse).toHaveBeenCalledWith(mockRes, error);
      expect(mockSendErrorResponse).toHaveReturnedWith(response);
    });
  });
});
