import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LogInDTO, SignUpDTO } from './dtos/auth';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { User } from '@root/generated/prisma';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignUpDTO) {
    return this.authService.signup(body);
  }

  @Post('login')
  async login(@Body() body: LogInDTO) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard)
  @Get('check')
  check(@Request() request: { user: User }): User {
    return request.user;
  }
}
