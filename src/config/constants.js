import { Utils } from "@/helpers";

export const NODE_ENV = process.env.NODE_ENV;
export const HOST = process.env.HOST || 3000;
export const PORT = process.env.PORT || 3001;
export const DB_URL =
  process.env.DB_URL || Utils.error("'DB_URL' constant missing!");
export const SECRET_KEY =
  process.env.SECRET_KEY || Utils.error("'SECRET_KEY' constant missing!");
