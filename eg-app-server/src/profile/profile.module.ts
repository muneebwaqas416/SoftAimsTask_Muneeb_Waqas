import { Module } from '@nestjs/common';
import { SiginGaurd } from 'src/signin/signin.gaurd';
import { ProfileController } from './profile.controller';

@Module({
  controllers: [ProfileController],
  providers: [SiginGaurd],
})
export class ProfileModule {}
