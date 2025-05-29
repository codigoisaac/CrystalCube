import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO, SignupDTO } from './dtos/auth';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const signupDTO: SignupDTO = {
    name: 'Tarantino Tester',
    email: 'tarantino@tester.com',
    password: 'Str0ngP@ss',
    passwordConfirm: 'Str0ngP@ss',
  };

  const loginDTO: LoginDTO = {
    email: 'tarantino@tester.com',
    password: 'Str0ngP@ss',
  };

  const existingUser = {
    id: 1,
    name: 'Tarantino Tester',
    email: 'tarantino@tester.com',
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
    jwtService = module.get(JwtService);
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

      await expect(authService.signup(signupDTO)).rejects.toThrow(
        new UnauthorizedException('User already exists'),
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDTO.email },
      });

      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    test('Should create a new user successfully', async () => {
      jest.mocked(prismaService.user.findUnique).mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hash3dP@ss' as never);
      jest.mocked(prismaService.user.create).mockResolvedValue(existingUser);

      const result = await authService.signup(signupDTO);

      expect(result).toEqual({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDTO.email },
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(signupDTO.password, 10);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: signupDTO.name,
          email: signupDTO.email,
          password: 'hash3dP@ss',
        },
      });
    });
  });

  describe('Login', () => {
    test('Should return access token for valid credentials', async () => {
      const mockToken = 'mock.jwt.token';

      jest
        .mocked(prismaService.user.findUnique)
        .mockResolvedValue(existingUser);

      jest.mocked(mockedBcrypt.compare).mockResolvedValue(true as never);

      jest.mocked(jwtService.signAsync).mockResolvedValue(mockToken);

      const result = await authService.login(loginDTO);

      expect(result).toEqual({ accessToken: mockToken });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDTO.email },
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDTO.password,
        existingUser.password,
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      });
    });

    test('Should throw UnauthorizedException if user is not found', async () => {
      jest.mocked(prismaService.user.findUnique).mockResolvedValue(null);

      await expect(authService.login(loginDTO)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    test('Should throw UnauthorizedException if password is invalid', async () => {
      jest
        .mocked(prismaService.user.findUnique)
        .mockResolvedValue(existingUser);

      jest.mocked(mockedBcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.login(loginDTO)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
