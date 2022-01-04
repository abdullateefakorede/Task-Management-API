import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Date, required: true })
  birthdate: Date;

  @Prop({ required: true })
  nationality: String;

  @Prop({ required: true, unique: true })
  id: String;
}

export const UserSchema = SchemaFactory.createForClass(User);
