import { authRouters } from './auth/routers';
import { awsIdentityRouters } from './aws-identity/routers';
import { userRouters } from './user/routers';

export const routers = [...awsIdentityRouters, ...authRouters, ...userRouters];
