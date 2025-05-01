import { Controller, Get, UseGuards } from '@nestjs/common';
import { SiginGaurd } from 'src/signin/signin.gaurd';

@Controller('api/profile')
export class ProfileController {
  @UseGuards(SiginGaurd)
  @Get()
  async profile() {
    return {
      error: false,
      message: 'User profile fetched successfully',
    };
  }
}
