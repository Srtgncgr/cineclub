import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
  }
} 