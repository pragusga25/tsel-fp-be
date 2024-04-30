import { config } from './config';
import { TokenExpiredError as Tex } from './errors';
import { IJwtPayload } from './interfaces';
import {
  sign,
  verify,
  JsonWebTokenError,
  TokenExpiredError,
} from 'jsonwebtoken';
import { Response } from 'express';

export class JwtUtil {
  static generateAccessToken(payload: IJwtPayload) {
    return sign(payload, config.JWT_SECRET, {
      expiresIn: 60 * 15, // 15 minutes
    });
  }

  static generateRefreshToken(payload: IJwtPayload) {
    return sign(payload, config.JWT_SECRET, {
      expiresIn: '7d', // 7 days
    });
  }

  static verifyToken(token: string) {
    try {
      return verify(token, config.JWT_SECRET) as IJwtPayload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        this.handleError(error);
      }
      throw error;
    }
  }

  private static handleError(error: JsonWebTokenError) {
    if (error instanceof TokenExpiredError) {
      throw new Tex();
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
