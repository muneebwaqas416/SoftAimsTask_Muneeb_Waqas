import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { SignupController } from './signup/signup.controller';
import { UserService } from './user/user.service';
import { SignupModule } from './signup/signup.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { SigninModule } from './signin/signin.module';
import { ProfileModule } from './profile/profile.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not defined');
        return {
          uri,
          connectionFactory: (connection) => {
            connection.once('open', () => {
              console.log('✅ MongoDB connected to:', uri);
            });
            connection.on('error', (err) => {
              console.error('❌ MongoDB connection error:', err);
            });
            return connection;
          },
        };
      },
    }),    
    UserModule,
    SignupModule,
    SigninModule,
    ProfileModule,
    ChatModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
