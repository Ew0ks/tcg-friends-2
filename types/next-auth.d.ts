import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: number;
    username: string;
    role: UserRole;
    credits: number;
    totalBoostersOpened: number;
    legendaryCardsFound: number;
    shinyCardsFound: number;
  }

  interface Session {
    user: User & {
      id: number;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: number;
    role: UserRole;
  }
} 