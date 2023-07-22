import { cloneDeep } from 'lodash';

export class GetLanguage {
  static getLangListModel<T>(data: any[], lang: string, keys: string[] = ['name'], arrayKey: string = 'languages'): T[] {
    if (!data?.length) return data
    return data.map((item) => {
      let itemJSON = item.toJSON()
      const language = (itemJSON[arrayKey] as any[] || []).find(temp => temp.language === lang);
      if (language) {
        if (keys?.length) {
          keys.forEach(key => {
            if ((language[key] ?? null) !== null) itemJSON[key] = language[key]
          })
        } else {
          itemJSON = {
            ...language,
            id: itemJSON.id,
          }
        }
      }
      return itemJSON
    })
  }

  static getLangList<T>(data: any[], lang: string, keys: string[] = ['name'], arrayKey: string = 'languages'): T[] {
    if (!data?.length) return data
    return data.map((item) => {
      let res = item.toJSON()
      const language = (item[arrayKey] as any[] || []).find(temp => temp.language === lang);
      if (language) {
        if (keys?.length) {
          keys.forEach(key => {
            if ((language[key] ?? null) !== null) res[key] = language[key]
          })
        } else {
          res = {
            ...language,
            id: res.id
          }
        }
      }
      return res
    })
  }

  static getLang<T>(data: any, lang: string, keys: string[] = ['name'], arrayKey: string = 'languages'): T {
    if (!data) return data
    let res = cloneDeep(data);
    const language = (res[arrayKey] as any[] || []).find(temp => temp.language === lang);
    if (language) {
      if (keys?.length) {
        keys.forEach(key => {
          if ((language[key] ?? null) !== null) res[key] = language[key]
        })
      } else {
        res = {
          ...language,
          id: res.id
        }
      }
    }
    return res
  }
}

export default GetLanguage;