import { JwtUtil } from '../../__shared__/utils';
import { db } from '../../db';
import { WrongCredentialsError } from '../errors';
import { LoginData } from '../validations';
import bcrypt from 'bcrypt';

export const loginService = async (data: LoginData) => {
  const { username, password } = data;

  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new WrongCredentialsError();
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new WrongCredentialsError();
  }

  const accessToken = JwtUtil.generateToken(user);

  return { result: { accessToken } };
};
