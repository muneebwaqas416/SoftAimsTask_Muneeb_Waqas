import { UserService } from './user.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/createUser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(): string {
    return 'user';
  }
}
