import axios from "axios";
import messages from "./messages";

export class Utils {
  constructor() {}

  static get env() {
    return {
      isTest: process.env.NODE_ENV === "test",
      isDev: process.env.NODE_ENV === "development",
      isProd: process.env.NODE_ENV === "production"
    };
  }

  static error(message) {
    if (Utils.env.isDev) {
      console.log(message);
    }
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
    Utils.required({
      baseURL: axiosConfig.baseURL,
      init: axiosConfig.init
    });

    // if required fields not provided in .env file...
    let missing = Object.entries(axiosConfig.init).filter(kv => {
      const [k, v] = kv;
      if (typeof v === "undefined") {
        return true;
      }
    });

    this.initialized = !missing.length;
    if (!this.initialized) {
      // mark as "not initialized"
      const fields = missing.map(item => item[0]).join(", ");
      console.log(`❌ ${this.constructor.name} - Required fields: ${fields}`);
    } else {
      console.log(`✅ ${this.constructor.name}`);
    }

    this.authorization = false;
    this.messages = messages;
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

  get granted() {
    return this.hasOwnProperty("authorization") && this.authorization
      ? true
      : false;
  }

  error(err) {
    Utils.error(err);
  }

  required(needed) {
    Utils.required(needed);
  }
}
