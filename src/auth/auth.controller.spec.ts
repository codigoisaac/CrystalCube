import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDTO, LoginDTO } from './dtos/auth';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  const signupDto: SignupDTO = {
    name: 'Tarantino Tester',
    email: 'tarantino@tester.com',
    password: 'Str0ngP@ss',
    passwordConfirm: 'Str0ngP@ss',
  };

  const loginDto: LoginDTO = {
    email: 'tarantino@tester.com',
    password: 'Str0ngP@ss',
  };

  const userResponse = {
    id: 1,
    email: 'tarantino@tester.com',
    name: 'Tarantino Tester',
  };

  const loginResponse = {
    accessToken: 'mock.jwt.token',
  };

  const mockUser = {
    name: 'Tarantino Tester',
    id: 1,
    email: 'tarantino@tester.com',
    password: 'Str0ngP@ss',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('SignUp', () => {
    test('Should create a new user successfully', async () => {
      authService.signup.mockResolvedValue(userResponse);

      const result = await authController.signup(signupDto);

      expect(result).toEqual(userResponse);
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(authService.signup).toHaveBeenCalledTimes(1);
    });

    test('Should pass through service errors', async () => {
      const error = new Error('User already exists');

      authService.signup.mockRejectedValue(error);

      await expect(authController.signup(signupDto)).rejects.toThrow(error);
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('Login', () => {
    test('Should login user successfully', async () => {
      authService.login.mockResolvedValue(loginResponse);

      const result = await authController.login(loginDto);

      expect(result).toEqual(loginResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    test('Should pass through service errors', async () => {
      const error = new Error('Invalid credentials');

      authService.login.mockRejectedValue(error);

      await expect(authController.login(loginDto)).rejects.toThrow(error);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('Check Auth', () => {
    test('Should return user data from request', async () => {
      const mockRequest = { user: mockUser };

      const result = authController.check(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});
