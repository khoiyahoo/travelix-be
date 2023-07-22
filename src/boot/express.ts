import express, { Application, Request, Response, NextFunction } from 'express';
// import { SocketService } from 'helper/socket';
import http from "http";
import setDI from './di';
import path from 'path';
import logger from 'morgan';
import multer from 'multer';
import cors from 'cors';
// import responseHelper from 'helper/response';
import passport from 'passport';
import configPassport from 'middlewares/passport';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from 'config/swagger.json';
import i18next from 'i18next'
import i18nextMiddleware from 'i18next-http-middleware'
import { restRouter } from 'routes';
import { NODE_ENV, SEQUELIZE_SYNC } from 'common/general';
import database from 'database/models';
import ResponseHelper from 'helper/response';
import TranslationController from 'modules/main/translation/translation.controller';
import initConfigs from 'middlewares/configs';
import initScheduleJobs from "middlewares/cronjob"

setDI()

const app: Application = express();

const server = http.createServer(app);

// app.socketService = new SocketService(server)

app.use(cors());

i18next
.use(i18nextMiddleware.LanguageDetector).init({
  lng: 'vi',
  partialBundledLanguages: true,
  load: 'languageOnly',
  lowerCaseLng: true,
  fallbackLng: 'vi',
  ns: ['common'],
  defaultNS: 'common',
  detection: {
    order: ['header', 'querystring', 'cookie', 'session'],
    lookupQuerystring: 'lang',
    lookupCookie: 'lang',
    lookupHeader: 'lang',
    lookupSession: 'lang',
    lookupPath: 'lang'
  }
})

app.use('/data', express.static(path.join(__dirname, "../../data")));
app.use('/static', express.static(path.join(__dirname, "../../static")));

app.use(i18nextMiddleware.handle(i18next))

app.use(initConfigs)

app.use(TranslationController.getLocale)

app.disable('x-powered-by');

app.enable('trust proxy')

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
  app.use(logger('dev'));
}

app.use(multer().any());

app.use(ResponseHelper.middlewareResponse);

initScheduleJobs();

app.use(passport.initialize());

configPassport();

app.use('/', restRouter);

// app.get('/client-ip', (req: Request, res: Response) => {
//   return res.onSuccess({
//     ip: req.ip
//   })
// })

if (process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
  app.use("/swagger",
    swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
    })
  );
}

if (process.env.SEQUELIZE_SYNC === SEQUELIZE_SYNC.ALTER) {
  database.sequelize.sync({ alter: true });
} else if (process.env.SEQUELIZE_SYNC === SEQUELIZE_SYNC.FORCE && process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
  database.sequelize.sync({ force: true });
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error('Not found');
  next(error);
});

interface ErrorWithStatus extends Error {
  status?: number
}

app.use((error: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500).json({
    status: error.status || 500,
    error: error.message
  })
})

export default server;