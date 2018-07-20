import messages from "./messages";

export const isTest = process.env.NODE_ENV === "test";
export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";

export function error(message) {
  throw new Error(message);
}

export function mandatory(needed) {
  let missing = [];
  for (const field in needed) {
    if (needed.hasOwnProperty(field)) {
      if (typeof needed[field] === "undefined") {
        missing.push(field);
      }
    }
  }
  if (missing.length) {
    throw new Error(
      `${missing.length} ${messages.DATA_MISSING}: '${missing.join("', '")}'`
    );
  }
}
