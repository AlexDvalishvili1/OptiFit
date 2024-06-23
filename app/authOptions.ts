import {AuthOptions, User} from "next-auth";
import {MongoDBAdapter} from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import {createUser, getUser} from "@/actions/db-actions";

export const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials, req): Promise<User | null> {
                const {email, password} = credentials;

                if (req.body.register) {
                    try {
                        const newUser = await createUser(email, password);
                        if (newUser) {
                            return newUser;
                        }
                        throw new Error("This email address already exists.");
                    } catch (error: any) {
                        throw new Error(error.message);
                    }
                } else {
                    const user = await getUser(email, password);
                    if (user) {
                        return user;
                    }
                    throw new Error("Incorrect email or password");
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET!,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.accessToken = (user as any).access_token;
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}) {
            session.accessToken = token.accessToken as string;
            (session.user as any).id = token.id;

            return session;
        },
    },
};