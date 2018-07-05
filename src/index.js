var express = require("express"),
  app = express(),
  path = require("path"),
  morgan = require("morgan"),
  bodyParser = require("body-parser");

// UYGULAMA YAPILANDIRMA
// ##################################################

app.set("port", 3000);

// tüm istekleri consolda göster
app.use(morgan("dev"));

// html'den gelen veriyi ayrıştır
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// CORS istek işlemleri için uygulamayı yapıladır (diğer tüm domainlerden hatasız erişilebilmesi için)
app.use(function(req, res, next) {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE" /*OPTIONS*/,
    "Access-Control-Allow-Headers":
      "X-Requested-With, content-type, Authorization",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "frame-ancestors 'none'"
  });
  next();
});

app.use(function(err, req, res, next) {
  return res.status(err.status || 500).json(err);
});

app.get("/", function(req, res) {
  res.send("OKdsdsssss");
});

// ana CATCHALL route (kullanıcıları front-end e gönderir) / önemli: tüm routelardan sonra yazılmalı
app.get("*", function(req, res) {
  res.send("OK");
});

/* // SERVERİ BAŞLAT
// ##################################################
app.listen(app.get("port"), function() {
  console.log("### Sunucu " + app.get("port") + " portunda çalışıyor...");
}); */

export default app;
