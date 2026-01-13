import {SignJWT, jwtVerify} from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type JwtPayload = {
    sub: string;
    phone: string;
    onboarded?: boolean; // <= новое
};

export async function signToken(payload: JwtPayload) {
    const expiresIn = "365d";
    return new SignJWT(payload)
        .setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);
}

export async function verifyToken(token: string) {
    const {payload} = await jwtVerify(token, secret);
    return payload;
}