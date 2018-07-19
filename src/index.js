import express from "express";
import path from "path";
// import "@/config/database";
import middlewares from "@/config/middlewares";
import routes from "@/routes";

const app = express();

middlewares(express, app);

app.use("/api", routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  const { message, status } = err;
  return res.status(status || 500).json({ message });
});

// ana CATCHALL route (kullanıcıları front-end e gönderir) / önemli: tüm routelardan sonra yazılmalı
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

export default app;
