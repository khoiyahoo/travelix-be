import { Inject, Service } from "typedi";
import { Request, Response } from 'express';
import { langs } from "models/general";
import fs from "fs";
@Service()
export default class TranslationService {
  constructor(
    @Inject('translationsModel') private translationsModel: ModelsInstance.Translations,
  ) {
  }
  public async findAll(lng: string, ns: string, res: Response) {
    try {
      const translations = await this.translationsModel.findAll({
        where: {
          language: lng,
          namespace: ns
        }
      });
      const result: { [key: string]: string } = {}
      translations.forEach(item => {
        result[item.key] = item.data
      })
      return res.json(result);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error
      });
    }
  }

  public async getLocale(req: Request, res: Response) {
    const translations = await this.translationsModel.findAll({});
    const result: { [key: string]: any } = {}
    langs.forEach(lang => {
      const data: { [key: string]: string } = {}
      translations.forEach(item => {
        if (item.language === lang.id) data[item.key] = item.data
      })
      result[lang.id as string] = data
    })
    return result
  }

  public async syncFromDB(res: Response) {
    try {
      const result: { old: string, new: string }[] = [];
      const translations = await this.translationsModel.findAll({});
      fs.readdirSync( `${__dirname}/../../../database/translations`).filter(lang => lang !== ".DS_Store").forEach(lang => {
        fs.readdirSync(`${__dirname}/../../../database/translations/${lang}`).forEach(file => {
          const filePath = `${__dirname}/../../../database/translations/${lang}/${file}`
          const rawData = fs.readFileSync(filePath, { encoding: 'utf8' })
          let dataJson = JSON.parse(rawData);
          Object.keys(dataJson).forEach(key => {
            const translation = translations.find(it => it.key === key && it.language === lang)
            if (translation && dataJson[key] !== translation.data) {
              result.push({ old: dataJson[key], new: translation.data })
              dataJson[key] = translation.data
            }
          })
          // fs.writeFileSync(filePath, JSON.stringify(dataJson), { encoding: 'utf8' })
        })
      })
      return res.onSuccess(result)
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error
      });
    }
  }
}