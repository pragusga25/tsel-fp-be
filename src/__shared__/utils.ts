import { config } from './config';
import {
  TokenExpiredError as Tex,
  AccessTokenExpiredError as ATex,
  RefreshTokenExpiredError as RTex,
} from './errors';
import { IJwtPayload } from './interfaces';
import {
  sign,
  verify,
  JsonWebTokenError,
  TokenExpiredError,
} from 'jsonwebtoken';
import { Response } from 'express';

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
export class JwtUtil {
  static generateAccessToken(payload: IJwtPayload) {
    return sign(payload, config.JWT_SECRET, {
      expiresIn: 60 * 30, // 30 minutes
    });
  }

  static generateRefreshToken(payload: IJwtPayload) {
    return sign(payload, config.JWT_SECRET, {
      expiresIn: '7d', // 7 days
    });
  }

  static verifyToken(token: string, isAccessToken = true) {
    try {
      return verify(token, config.JWT_SECRET) as IJwtPayload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        this.handleError(error, isAccessToken);
      }
      throw error;
    }
  }

  private static handleError(error: JsonWebTokenError, isAccessToken = true) {
    if (error instanceof TokenExpiredError) {
      throw isAccessToken ? new ATex() : new RTex();
    }

    throw error;
  }
}

export class HttpUtil {
  static attachRefreshToken(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  }
}
