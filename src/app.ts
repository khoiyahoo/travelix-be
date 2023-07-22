// import "dotenv/config";
// import "reflect-metadata";
// import express from "express";
// const app = express();

// const runApp = () => {
//   try {
//     app.listen(process.env.PORT, () =>
//       console.log(`App listening at ${process.env.PORT}`)
//     );
//   } catch (error) {
//     console.error(error, "err");
//     process.exit(1);
//   }
// };

// runApp();

import 'dotenv/config';
import "reflect-metadata";
import server from 'boot/express';

const runApp = () => {
    try {
      server.listen(process.env.PORT, () => console.log(`App listening at ${process.env.PORT}`))
    } catch (error) {
      console.error(error, 'err');
      process.exit(1);
    }
}

runApp();

// import express from "express";
// import bodyParser from "body-parser";
// // import viewEngine from "./config/viewEngine";
// // import initWebRoutes from "./route/web";
// import connectDB from "./config/connectBD";
// import initWebRoutes from "routes/web";
// // require("dotenv").config();
// import "dotenv/config";

// let app = express();

// //config app

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // viewEngine(app);
// initWebRoutes(app);

// connectDB();

// let port = process.env.PORT || 8080;
// //Port === undefined => port = 6969

// app.listen(port, () => {
//   //callback
//   console.log("Backend Nodejs is runing on the port : " + port);
// });
