import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import { Config, ConfigType } from 'models/config';

export const getConfigs = async (): Promise<Config> => {
  const configsModel = Container.get<ModelsInstance.Configs>('configsModel')
  const configs = await configsModel.findAll()
  const data: any = {}
  configs.forEach(it => {
    switch (it.type) {
      case ConfigType.number:
        data[it.key] = Number(it.value)
        break;
      default:
        data[it.key] = JSON.stringify(it.value)
        break;
    }
  })
  return data
}

const initConfigs = async (req: Request, res: Response, next: NextFunction) => {
  const data = await getConfigs()
  req.configs = data
  res.configs = data
  next()
};

export default initConfigs