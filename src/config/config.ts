require('dotenv').config()

export const config: {port: number, secret:string, db_uri: string} = {
    port: Number(process.env.PORT) || 3001,
    secret: process.env.SECRET_KEY,
    db_uri: process.env.DB
}