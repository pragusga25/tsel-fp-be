import { JwtUtil } from '../../__shared__/utils';

export const refreshAccessTokenService = async (refreshToken: string) => {
  const { id, role, username, name, principalId, principalType } =
    JwtUtil.verifyToken(refreshToken);

  const user = {
    id,
    username,
    role,
    name,
    principalId,
    principalType,
  };

  const accessToken = JwtUtil.generateAccessToken(user);

  return { accessToken, user };
};
