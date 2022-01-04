import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './user.schema';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'NIL' })
  dueAt: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ required: true, unique: true })
  id: String;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'User', unique: false })
  userId: User;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
