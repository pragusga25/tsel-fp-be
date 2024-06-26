import { config } from './config';
import {
  AccessTokenExpiredError as ATex,
  RefreshTokenExpiredError as RTex,
} from './errors';
import { IJwtPayload, Trx } from './interfaces';
import {
  sign,
  verify,
  JsonWebTokenError,
  TokenExpiredError,
} from 'jsonwebtoken';
import { Response } from 'express';
import { db } from '../db';

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
      sameSite: 'none',
      secure: config.PROTOCOL === 'https',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  }

  static deleteCookie(res: Response) {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      sameSite: 'none',
      secure: config.PROTOCOL === 'https',
      maxAge: 0,
      path: '/',
    });
  }
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const toJakartaTime = (date: Date) => {
  // suppose the date is 12:00 UTC
  const invdate = new Date(
    date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    })
  );

  // then invdate will be 07:00 in Toronto
  // and the diff is 5 hours
  const diff = date.getTime() - invdate.getTime();

  // so 12:00 in Toronto is 17:00 UTC
  return new Date(date.getTime() - diff); // needs to substract
};

export const formatDateId = (timestamp: string | Date, withTimes = true) => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const date = new Date(timestamp);
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  let text = `${day} ${monthName} ${year}`;

  if (withTimes) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const hoursPadStr = hours.toString().padStart(2, '0');
    const minutesPadStr = minutes.toString().padStart(2, '0');
    text += ` ${hoursPadStr}:${minutesPadStr}`;
  }

  return text;
};

export const getLocaleDateString = (
  date: Date,
  opts?: Partial<{
    addDay: number;
    format: 'yyyy-mm-dd' | 'dd-mm-yyyy' | 'yyyy-mm-ddThh:MM';
    addHours: number;
  }>
) => {
  let theDate = date;

  if (opts?.addDay) {
    theDate = new Date(date.getTime() + opts.addDay * 24 * 60 * 60 * 1000);
  }

  if (opts?.addHours) {
    theDate = new Date(date.getTime() + opts.addHours * 60 * 60 * 1000);
  }

  let [dateStr, monthStr, yearStr] = theDate
    .toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
    })
    .split('/');

  dateStr = dateStr.padStart(2, '0');
  monthStr = monthStr.padStart(2, '0');

  if (opts?.format === 'yyyy-mm-dd') {
    return `${yearStr}-${monthStr}-${dateStr}`;
  }

  if (opts?.format === 'dd-mm-yyyy') {
    return `${dateStr}-${monthStr}-${yearStr}`;
  }

  if (opts?.format === 'yyyy-mm-ddThh:MM') {
    const [hoursStr, minutesStr] = theDate
      .toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
      })
      .split('.');

    return `${yearStr}-${monthStr}-${dateStr}T${hoursStr}:${minutesStr}`;

    // return `${yearStr}-${monthStr}-${dateStr}T${theDate
    //   .getHours()
    //   .toString()
    //   .padStart(2, '0')}:${theDate.getMinutes().toString().padStart(2, '0')}`;
  }

  return `${dateStr}-${monthStr}-${yearStr}`;
};

export const createLog = async (message: string, trx?: Trx) => {
  if (trx) {
    await trx.log.create({
      data: {
        message,
      },
    });
    return;
  }
  await db.log.create({
    data: {
      message,
    },
  });
};
