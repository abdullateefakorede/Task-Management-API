import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../utils/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { tokenData } from '../dtos/util.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string, rounds: number): Promise<string> {
    const salt: string = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(password, salt);
  }

  generateToken(payload): string {
    return this.jwtService.sign(payload);
  }

  decodeToken(token: string): tokenData {
    return this.jwtService.verify(token);
  }
}
