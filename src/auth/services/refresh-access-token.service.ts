import { JwtUtil } from '../../__shared__/utils';

export const refreshAccessTokenService = async (refreshToken: string) => {
  const { id, role, username, name } = JwtUtil.verifyToken(refreshToken);

  const user = {
    id,
    username,
    role,
    name,
  };

  const accessToken = JwtUtil.generateAccessToken(user);

  return { accessToken, user };
};
