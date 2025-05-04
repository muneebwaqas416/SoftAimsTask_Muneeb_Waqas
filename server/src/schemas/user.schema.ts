import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: true })
  status: boolean;

  @Prop({ required: true, default: Date.now, type: Date })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
