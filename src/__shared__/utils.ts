import { config } from './config';
import { TokenExpiredError as Tex } from './errors';
import { IJwtPayload } from './interfaces';
import {
  sign,
  verify,
  JsonWebTokenError,
  TokenExpiredError,
} from 'jsonwebtoken';

export class JwtUtil {
  static generateToken(payload: IJwtPayload) {
    return sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string) {
    try {
      return verify(token, config.JWT_SECRET) as IJwtPayload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        this.handleError(error);
      }
    }
  }

  private static handleError(error: JsonWebTokenError) {
    if (error instanceof TokenExpiredError) {
      throw new Tex();
    }

    throw error;
  }
}
