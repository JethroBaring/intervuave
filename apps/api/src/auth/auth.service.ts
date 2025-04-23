import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './token-payload.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const accessExpirationMs = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION_MS',
    );

    const refreshExpirationMs = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_MS',
    );

    if (!accessExpirationMs || !refreshExpirationMs) {
      throw new Error(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS or JWT_REFRESH_TOKEN_EXPIRATION_MS not found',
      );
    }

    const expiresAccessToken = new Date();
    expiresAccessToken.setTime(
      expiresAccessToken.getTime() + Number(accessExpirationMs),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() + Number(refreshExpirationMs),
    );

    const tokenPayload: TokenPayload = { userId: user.id };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: accessExpirationMs,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: refreshExpirationMs,
    });

    await this.usersService.update(user.id, {
      refreshToken: await hash(refreshToken, 10),
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      expires: expiresRefreshToken,
    });
  }

  async signup(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);

      const authenticated = await compare(password, user.password);

      if (!authenticated) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async veryifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.findOne(userId);
      const authenticated = await compare(refreshToken, user.refreshToken!);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }

  async signout(userId: string, response: Response): Promise<void> {
    try {
        await this.usersService.update(userId, { refreshToken: null });
    } catch(error) {
        console.error(`Failed to clear refresh token for user ${userId}:`, error);
    }

    const commonCookieOptions = {
        httpOnly: true,
        path: '/',
    }

    response.clearCookie('Authentication', commonCookieOptions);
    response.clearCookie('Refresh', commonCookieOptions);
  }
}
