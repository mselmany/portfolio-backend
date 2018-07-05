import app from "./src"; // configuring express app, e.g. routes and logic

function startServer() {
  return new Promise((resolve, reject) => {
    const httpServer = app.listen(app.get("port"));

    httpServer.once("error", err => {
      if (err.code === "EADDRINUSE") {
        reject(err);
      }
    });

    httpServer.once("listening", () => resolve(httpServer));
  }).then(httpServer => {
    const { port } = httpServer.address();
    console.info(
      `==> 🌎 Listening on ${port}. Open up http://localhost:${port}/ in your browser.`
    );

    // Hot Module Replacement API
    if (module.hot) {
      let currentApp = app;
      module.hot.accept("./app", () => {
        httpServer.removeListener("request", currentApp);
        import("./app")
          .then(({ default: nextApp }) => {
            currentApp = nextApp;
            httpServer.on("request", currentApp);
            console.log("HttpServer reloaded!");
          })
          .catch(err => console.error(err));
      });

      // For reload main module (self). It will be restart http-server.
      module.hot.accept(err => console.error(err));
      module.hot.dispose(() => {
        console.log("Disposing entry module...");
        httpServer.close();
      });
    }
  });
}

startServer();