export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import NextAuth from "next-auth";
import {authOptions} from "@/app/authOptions";

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};