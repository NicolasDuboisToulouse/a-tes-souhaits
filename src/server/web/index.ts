import express from "express";
import ViteExpress from "vite-express";
import cors from "cors";
import * as error from "../error";
import logger from "../logger";

export function start() {

  const app = express();
  app.set("env", "development");
  app.use(cors());
  app.use(express.json());

  // Handle stashed error
  app.use((
    _req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ) => {
    if (error.getStashed()) {
      throw error.getStashed();
    } else {
      next();
    }
  });

  // TODO: Force secure
  // if (process.env.NODE_ENV === "production") {
  //     https
  //         .createServer(httpsOptions, app)
  //         .listen(443, () => debug.info("Server listening on port 443"));

  //     app.use((request, response, next) => {
  //         if (!request.secure) {
  //             return response.redirect("https://" + request.headers.host + request.url);
  //         }

  //         next();
  //     });

  // TODO: Cookies
  // app.use(express.urlencoded({ extended: true }));
  // app.use(
  //     session({
  //         secret: config.session_secret,
  //         resave: false,
  //         saveUninitialized: true,
  //     })
  // );
  // app.use(cookieParser(config.session_secret));

  //
  // Some tests
  //
  app.all("/hello", (
    req: express.Request,
    res: express.Response
  ) => {
    logger.info("req", req.body);
    res.json({ hello: "world" });
  });

  app.all("/error", (
    _req: express.Request,
    _res: express.Response
  ) => {
    error.send(error.HTTP.codes.BadRequest, "An Error");
  });

  app.all("/timeout", async(
    _req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ) => {
    setTimeout(() => {
      try {
        error.send(error.HTTP.codes.InternalServerError);
      } catch(err) {
        next(err);
      }
    }, 1000);
  });

  // Hanlde functional error
  app.use((
    err: Error,
    _req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    // just call the main error handler
    next(err);
  });

  // Only the root is serve by vite
  ViteExpress.config({ ignorePaths: /^\/.+$/ });
  app.use(ViteExpress.static());

  // Launch ViteExpress
  function viteExpressStarted() {
    logger.info("Server is listening on port 3000...");
    error.expressMiddleware.install(app);
  }
  ViteExpress.listen(app, 3000, viteExpressStarted);
}
