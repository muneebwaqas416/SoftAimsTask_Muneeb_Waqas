import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { SignupController } from './signup.controller';
import { UserService } from 'src/user/user.service';
import { SignupService } from './signup.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [SignupController],
  providers: [UserService, SignupService],
})
export class SignupModule {}
