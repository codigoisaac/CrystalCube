import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload: { [key: string]: any } = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers['authorization'] as string;

    if (authorizationHeader === null || authorizationHeader === undefined) {
      return undefined;
    }

    const [type, token] = authorizationHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}
