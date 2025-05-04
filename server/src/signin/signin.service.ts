import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SigninUserDto } from 'src/dto/signinUser.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SigninService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(signinUserDto: SigninUserDto): Promise<any> {
    const user = await this.userService.findUserByEmail(signinUserDto.email);
    if (user && user.length === 0) {
      throw new NotFoundException();
    }
    if (user[0].password !== signinUserDto.password) {
      throw new UnauthorizedException();
    }
    const payload = { userEmail: user[0].email, sub: 1 };
    return {
      access_token: await this.jwtService.signAsync(payload),
      username: user[0].name,
    };
  }
}
