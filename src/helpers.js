import axios from "axios";
import messages from "./messages";

export const isTest = process.env.NODE_ENV === "test";
export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";

export class Utils {
  constructor() {}

  static error(message) {
    throw new Error(message);
  }

  static required(needed) {
    let missing = [];
    for (const field in needed) {
      if (needed.hasOwnProperty(field)) {
        if (typeof needed[field] === "undefined") {
          missing.push(field);
        }
      }
    }
    if (missing.length) {
      Utils.error(
        `${missing.length} ${messages.DATA_MISSING}: '${missing.join("', '")}'`
      );
    }
  }
}

export class ApiBase {
  constructor(axiosConfig = {}, { interceptor } = {}) {
    Utils.required({ baseURL: axiosConfig.baseURL });
    this.perpage = 10;
    this.client = axios.create(axiosConfig);
    if (interceptor instanceof Function) {
      this.client.interceptors.request.use(
        config => {
          interceptor(config);
          return config;
        },
        error => {
          return Promise.reject(error);
        }
      );
    }
  }

  error(err) {
    Utils.error(err);
  }

  required(needed) {
    Utils.required(needed);
  }
}
