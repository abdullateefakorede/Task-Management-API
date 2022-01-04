import * as bcrypt from 'bcrypt';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { disconnect, Model } from 'mongoose';
import { UserService } from '../../../src/user/user.service';
import {
  User,
  UserDocument,
  UserSchema,
} from '../../../src/utils/schemas/user.schema';
import { config } from '../../../src/config/config';
import { ConfigModule } from '@nestjs/config';

describe('UserService', () => {
  let userService: UserService;
  let jwtService: JwtService;
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
      ],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
      ],
    }).compile();

    userService = await app.resolve(UserService);
    jwtService = await app.resolve(JwtService);
    userModel = await app.resolve(getModelToken(User.name));
  });
  afterAll(async () => disconnect());

  describe('hashPassword', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return hashedPassword', async () => {
      const password = 'Kibo2356f3r@';
      const rounds = 9;
      const hashedPassword = '6532FDVET3TRFCNBFKRHFHBVibo2356f3r@';
      const salt = 'hhehvefhvhev';
      const mockGenSalt = jest
        .spyOn(bcrypt, 'genSalt')
        .mockImplementationOnce(() => salt);
      const mockHash = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => hashedPassword);

      await userService.hashPassword(password, rounds);

      expect(mockGenSalt).toHaveBeenCalledTimes(1);
      expect(mockGenSalt).toHaveBeenCalledWith(rounds);
      expect(mockHash).toHaveBeenCalledTimes(1);
      expect(mockHash).toHaveBeenCalledWith(password, salt);
      expect(mockHash).toHaveReturnedWith(hashedPassword);
    });
  });

  describe('generateToken', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return generated token', () => {
      const data = { username: 'kobo245', id: 'g5Y35' };
      const generatedToken =
        'dgefhcyefvu7653rbfghheerrygvhgrj6532FDVET3TRFCNBFKRHFHBVibo2356f3r@';
      const mockSign = jest
        .spyOn(jwtService, 'sign')
        .mockImplementationOnce(() => generatedToken);

      userService.generateToken(data);

      expect(mockSign).toHaveBeenCalledTimes(1);
      expect(mockSign).toHaveBeenCalledWith(data);
      expect(mockSign).toHaveReturnedWith(generatedToken);
    });
  });

  describe('generateToken', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return generated token', () => {
      const data = { username: 'kobo245', id: 'g5Y35' };
      const token =
        'dgefhcyefvu7653rbfghheerrygvhgrj6532FDVET3TRFCNBFKRHFHBVibo2356f3r@';
      const mockVerify = jest
        .spyOn(jwtService, 'verify')
        .mockImplementationOnce(() => data);

      userService.decodeToken(token);

      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(mockVerify).toHaveBeenCalledWith(token);
      expect(mockVerify).toHaveReturnedWith(data);
    });
  });
});
