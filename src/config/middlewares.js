import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import methodOverride from "method-override";
import cors from "cors";
import favicon from "serve-favicon";
import path from "path";
import { isTest, isDev, isProd } from "@/helpers";

export default (express, app) => {
  app.use(compression());
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
      origin: process.env.FRONT_ORIGIN // Change allowed origin url for production
    })
  );
  app.use(methodOverride());

  if (isProd) {
    app.use(favicon(path.resolve(__dirname, "public/favicon.ico")));
    app.use(express.static(path.resolve(__dirname, "public")));
  }
  if (isDev && !isTest) {
    app.use(morgan("dev"));
  }
};
