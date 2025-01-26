import NextAuth, { AuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: UserRole;
      credits: number;
      username: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string | number;
    role: UserRole;
    credits: number;
    username: string;
    name?: string | null;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    credits: number;
    username: string;
  }
}

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.username,
          role: user.role,
          credits: user.credits,
          username: user.username,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Première connexion : on initialise le token avec les données de l'utilisateur
        token.id = user.id.toString();
        token.role = user.role;
        token.credits = user.credits;
        token.username = user.username;
        return token;
      }

      // Mises à jour suivantes : on récupère les données à jour
      const updatedUser = await prisma.user.findUnique({
        where: { id: Number(token.id) }
      });

      if (updatedUser) {
        token.credits = updatedUser.credits;
        token.role = updatedUser.role;
        token.username = updatedUser.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.id);
        session.user.role = token.role;
        session.user.credits = token.credits;
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: true
};

export default NextAuth(authOptions); 