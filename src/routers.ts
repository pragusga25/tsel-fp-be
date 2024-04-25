import { authRouters } from './auth/routers';
import { awsIdentityRouters } from './aws-identity/routers';

export const routers = [...awsIdentityRouters, ...authRouters];
