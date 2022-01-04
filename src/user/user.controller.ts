import * as bcrypt from 'bcrypt';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateRandomId } from '../utils/common';
import { User, UserDocument } from '../utils/schemas/user.schema';
import { signIn, UserSignUp } from './user.dto';
import { UserService } from './user.service';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../helpers/response.helper';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Post('signin')
  async signIn(@Req() req, @Body() body: signIn, @Res() res): Promise<any> {
    try {
      const { username, password } = body;
      const user = await this.userModel.findOne({ username }).exec();
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return sendErrorResponse(res, 'INVALID_USERNAME_OR_PASSWORD');
      }
      const userData = { id: user.id, username: user.username };
      const token = this.userService.generateToken(userData);
      return sendSuccessResponse(
        res,
        { ...userData, token },
        'SIGN_IN_SUCCESSFUL',
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  @Post('signup')
  async signUp(@Body() body: UserSignUp, @Res() res): Promise<any> {
    try {
      const user = await this.userModel
        .findOne({ username: body.username })
        .exec();
      if (user) {
        return sendErrorResponse(res, 'USER_ALREADY_EXIST');
      }
      const id: string = generateRandomId(5);
      const password: string = await this.userService.hashPassword(
        body.password,
        9,
      );
      const newUser = {
        ...body,
        password,
        id,
      };
      const userData = await this.userModel.create(newUser)
      return sendSuccessResponse(res, userData, 'SIGN_UP_SUCCESSFUL');
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}
