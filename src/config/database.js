import mongoose from "mongoose";
import { DB_URL } from "@/constants";

// Remove the warning with Promise
mongoose.Promise = global.Promise;

try {
  mongoose.connect(DB_URL);
} catch (err) {
  mongoose.createConnection(DB_URL);
}

mongoose.connection
  .once("open", () => console.log("MongoDB Running..."))
  .on("error", e => {
    throw e;
  });
