import dotenv from "dotenv";
dotenv.config("./.env");

export const config = {
    port: parseInt(process.env.PORT),
    mongoUrl: String(process.env.MONGODB_URL),
    tokenSecret: String(process.env.TOKEN_SECRET),
    tokenExpiry: String(process.env.TOKEN_EXPIRY),
    sessionSecret: String(process.env.SESSION_SECRET_KEY),
    sessionCookieExpiry: parseInt(process.env.SESSION_COOKIE_EXPIRY)
}
