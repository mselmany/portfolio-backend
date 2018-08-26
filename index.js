import chalk from "chalk";
import app from "@";
import { PORT, NODE_ENV } from "@/config/constants";

startServer();

function startServer() {
  return new Promise((resolve, reject) => {
    const httpServer = app.listen(PORT);

    httpServer.once("error", err => {
      if (err.code === "EADDRINUSE") {
        reject(err);
      }
    });

    httpServer.once("listening", () => resolve(httpServer));
  })
    .then(httpServer => {
      const { port } = httpServer.address();
      const running = chalk.hex("#10a567").bold("[RUNNING]");
      const reloaded = chalk.hex("#007acc").bold("[RELOADED]");
      const env = chalk.hex("#10a567").bold("[MODE]");
      const url = chalk.bold(`http://localhost:${port}/api/status`);

      console.info(
        `${running} 🌎  Listening on ${port}. Open up "${url}" in your browser.`
      );

      // Hot Module Replacement API
      if (module.hot) {
        let currentApp = app;
        module.hot.accept("./src", () => {
          httpServer.removeListener("request", currentApp);
          import("./src")
            .then(({ default: nextApp }) => {
              currentApp = nextApp;
              httpServer.on("request", currentApp);
              console.log("-------------------------");
              console.log(`${env} ${NODE_ENV.toUpperCase()}`);
              console.info(`${reloaded} Server reloaded! ${getTime()}`);
            })
            .catch(err => console.error(err));
        });

        // For reload main module (self). It will be restart http-server.
        module.hot.accept(err => console.error(err));
        module.hot.dispose(() => {
          console.log("#### Disposing entry module...");
          httpServer.close();
        });
      }
    })
    .catch(err => {
      console.error(err);
    });
}

function getTime() {
  const date = new Date();
  return `⏰  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
}
