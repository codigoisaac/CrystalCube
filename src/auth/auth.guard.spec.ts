import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
  } as unknown as ExecutionContext;

  const mockRequest = {
    headers: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);

    jest
      .mocked(mockExecutionContext.switchToHttp().getRequest)
      .mockReturnValue(mockRequest);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockRequest.headers = {};
  });

  test('Should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('Handle access request', () => {
    test('Should return true for valid JWT token', async () => {
      const mockPayload = {
        id: 1,
        email: 'tarantino@tester.com',
        name: 'Tarantino tester',
      };

      mockRequest.headers = { authorization: 'Bearer fakeValid.jwt.token' };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await authGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'fakeValid.jwt.token',
        { secret: process.env.JWT_SECRET },
      );

      expect(mockRequest['user']).toEqual(mockPayload);
    });

    test('Should throw UnauthorizedException when no authorization header', async () => {
      mockRequest.headers = {};

      await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    test('Should throw UnauthorizedException when authorization header is malformed', async () => {
      mockRequest.headers = { authorization: 'InvalidHeader' };

      await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });
});
