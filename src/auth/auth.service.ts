import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LogInDTO, SignUpDTO } from './dtos/auth';
import { PrismaService } from '@src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(data: SignUpDTO) {
    const isEmailAlreadyRegistered = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (isEmailAlreadyRegistered) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm, ...userData } = data;

    const user = await this.prismaService.user.create({
      data: { ...userData, password: hashedPassword },
    });

    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    return result;
  }

  async login(data: LogInDTO) {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const result = { accessToken };

    return result;
  }
}
