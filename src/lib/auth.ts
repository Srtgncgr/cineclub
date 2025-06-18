import { auth } from "@/app/api/auth/[...nextauth]/route";
 
export async function getAuthSession() {
  return await auth();
} 