import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import methodOverride from "method-override";
import cors from "cors";
import helmet from "helmet";
import favicon from "serve-favicon";
import path from "path";
import { Utils } from "@/helpers";

export default (express, app) => {
  app.use(helmet());
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
      origin: process.env.FRONT_ORIGIN // ! TODO:  Change allowed origin url for production
    })
  );
  app.use(methodOverride());

  if (Utils.env.isProd) {
    app.use(favicon(path.resolve(__dirname, "public/favicon.ico")));
    app.use(express.static(path.resolve(__dirname, "public")));
  }
  if (Utils.env.isDev && !Utils.env.isTest) {
    app.use(morgan("dev"));
  }
};
