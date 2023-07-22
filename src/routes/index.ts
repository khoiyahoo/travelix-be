import { Router } from 'express';
import { v1Router } from 'modules/index';

export const restRouter = Router(); 

restRouter.use('/v1.0', v1Router)