import { JwtUtil } from '../../__shared__/utils';
import { db } from '../../db';
import { WrongCredentialsError } from '../errors';
import { LoginData } from '../validations';
import bcrypt from 'bcrypt';

export const loginService = async (data: LoginData) => {
  const { username, password } = data;

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      password: true,
    },
  });

  if (!user) {
    throw new WrongCredentialsError();
  }

  const { password: pw, ...rest } = user;

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new WrongCredentialsError();
  }

  const accessToken = JwtUtil.generateAccessToken(rest);
  const refreshToken = JwtUtil.generateRefreshToken(rest);
  const { password: hp, ...restUser } = user;

  return { result: { accessToken, refreshToken, user: restUser } };
};
