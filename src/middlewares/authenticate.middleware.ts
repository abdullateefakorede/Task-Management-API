import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ErrorResponse } from '../helpers/response/error';
import { tokenData } from '../dtos/util.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(public readonly userService: UserService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token: string =
      req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      throw new ErrorResponse('Missing or Invalid Token');
    }

    try {
      const decoded: tokenData = this.userService.decodeToken(token);
      req['user'] = decoded;
      return next();
    } catch (error) {
      throw new ErrorResponse('Bad/Expired Token');
    }
  }
}
