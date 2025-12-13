import {SignJWT, jwtVerify} from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type JwtPayload = {
    sub: string; // user id
    email: string;
};

export async function signToken(payload: JwtPayload) {
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    return new SignJWT(payload)
        .setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);
}

export async function verifyToken(token: string) {
    const {payload} = await jwtVerify(token, secret);
    return payload; // has sub/email/iat/exp
}