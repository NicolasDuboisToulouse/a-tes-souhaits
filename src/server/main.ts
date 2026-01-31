import express from "express";
import ViteExpress from "vite-express";
import cors from "cors";

// import { HTTPErrorCodes, sendError } from "./error.js";

const app = express();
app.set("env", "development");
app.use(cors());
app.use(express.json());


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

app.all("/hello", (req: express.Request, res: express.Response) => {
  console.log("req", req.body);
  res.json({ hello: "world" });
});

app.all("/error", (_req: express.Request, _res: express.Response) => {
  throw new Error("An Error");
});

app.all("/timeout", async(_req: express.Request, _res: express.Response, next: express.NextFunction) => {
  setTimeout(() => {
    try {
      throw new Error("mlk");
    } catch(err) {
      next(err);
    }
  }, 1000);
  //  res.send("bar");
});


// ???
// import bodyParser from 'body-parser';
// import methodOverride from 'method-override';
// app.use(bodyParser.urlencoded({
//  extended: true
// }))
// app.use(bodyParser.json())
// app.use(methodOverride())

// Hanlde functional error
// TODO: Create a generic function that return either HTML or JSON
app.use((
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  console.log("APP Error CB");
  console.log("err", err);
  console.log("res", res);
  res.json({ foo: res.statusCode });
});

// Handle invalid URI
// TODO: Create a generic function that return either HTML or JSON
function installInvalidURIMiddleWare() {
  app.use((req: express.Request, res: express.Response) => {
    console.log("Undefined URI CB");
    console.log(req.get("Content-Type"));
    console.log(req.is("html"));
    console.log(req.is("json"));
    console.log(req.url);
    console.log("All times");
    res.send("Fail");
  });
}


// Only the root is serve by vite
ViteExpress.config({ ignorePaths: /^\/.+$/ });


// TODO ???
app.use(ViteExpress.static());

// Launch ViteExpress
function viteExpressStarted() {
  console.log("Server is listening on port 3000...");
  installInvalidURIMiddleWare();
}
ViteExpress.listen(app, 3000, viteExpressStarted);
