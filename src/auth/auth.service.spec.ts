import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDTO } from './dtos/auth';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: jest.Mocked<PrismaService>;

  const signUpDto: SignUpDTO = {
    name: 'Tarantino Tester',
    email: 'tarantino@teste.com',
    password: 'Str0ngP@ss',
    passwordConfirm: 'Str0ngP@ss',
  };

  const existingUser = {
    id: 1,
    name: 'Tarantino Tester',
    email: 'tarantino@teste.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Shoud be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('Signup', () => {
    test('Should throw UnauthorizedException if user already exists', async () => {
      jest
        .mocked(prismaService.user.findUnique)
        .mockResolvedValue(existingUser);

      await expect(authService.signup(signUpDto)).rejects.toThrow(
        new UnauthorizedException('User already exists'),
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });

      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    test('Should create a new user successfully', async () => {
      jest.mocked(prismaService.user.findUnique).mockResolvedValue(null);
      jest.mocked(prismaService.user.create).mockResolvedValue(existingUser);

      const result = await authService.signup(signUpDto);

      expect(result).toEqual({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: signUpDto.name,
          email: signUpDto.email,
          password: expect.any(String),
        },
      });
    });
  });
});
