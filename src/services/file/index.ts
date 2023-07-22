/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */
import fs from 'fs';
import path from 'path';
//import { FileResize, Resize } from 'services/resize-image';
import { v4 as uuidv4 } from 'uuid';


import {v2 as cloudinary} from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
const opts: any = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

export interface FileUploaded {
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  url: string;
  path: string;
}
export class FileService {
  public static async writeFile(path: number | fs.PathLike, data: string | NodeJS.ArrayBufferView, opts: fs.WriteFileOptions = 'utf8') {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(path, data, opts, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  public static async saveFile(
    path: number | fs.PathLike,
    data: string | NodeJS.ArrayBufferView,
    originalName: string
  ): Promise<FileUploaded> {
    try {
      const identifier = uuidv4().replace(/-/gi, "").replace(/0\./, '');
      const extension = originalName.split('.').length > 1 ? originalName.split('.').pop() : null
      let fileName = `${identifier}-${originalName}`
      if (extension) {
        fileName = originalName.replace(`.${extension}`, `-${identifier}.${extension}`)
      }
      fs.mkdirSync(__dirname + `/../../../data/${path}`, { recursive: true });
      await this.writeFile(__dirname + `/../../../data/${path}/${fileName}`, data)
      return {
        fileName: originalName,
        path: `data/${path}/${fileName}`,
        url: `${process.env.BASE_URL}/data/${path}/${fileName}`
      }
    } catch (err) {
      throw err;
    }
  }

  public static async upLoadAvatar(data: Express.Multer.File) {
    try {
      //const file: FileResize = await Resize(data.buffer, 120, 120, 'png', 'cover')
      return await this.saveFile('avatar', data.buffer, data.originalname)
    } catch (error) {
      throw error;
    }
  }

  public static async uploadAttachment(file: Express.Multer.File) {
    let fileUploaded: FileUploaded
    try {
      if (file) {
        fileUploaded = await this.saveFile('attachments', file.buffer, file.originalname)
        fileUploaded.fileSize = file.size
        fileUploaded.mimeType = file.mimetype
      }
      return fileUploaded
    } catch (error) {
      if (fileUploaded) this.deleteFile(fileUploaded.url)
      throw error;
    }
  }

  public static async uploadAttachments(data: Express.Multer.File[]) {
    const fileUploadeds: FileUploaded[] = []
    try {
      for (const file of data) {
        if (!file) continue
        const fileUploaded = await this.saveFile('attachments', file.buffer, file.originalname)
        fileUploaded.fileSize = file.size
        fileUploaded.mimeType = file.mimetype
        fileUploadeds.push(fileUploaded)
      }
      return fileUploadeds
    } catch (error) {
      this.deleteFiles(fileUploadeds.map(temp => temp.url))
      throw error;
    }
  }

  public static async uploadAttachments2(data: Express.Multer.File[]) {
    const fileUploadedUrls: any[] = []
    try {
      for (const file of data) {
        if (!file) continue
        const imageBase64 = "data:"+file.mimetype+";base64,"+file.buffer.toString('base64');
        // eslint-disable-next-line no-async-promise-executor
        const fileUploaded = await new Promise(async (resolve, reject) => {
          if(imageBase64) {
            cloudinary.uploader.upload(imageBase64, opts, (error, result) => {
              if (result && result.secure_url) {
                console.log(result.secure_url);
                return resolve(result.secure_url);
              }
              console.log(error.message);
              return reject({ message: error.message });
            });
          }
        });
        if(fileUploaded) {
          fileUploadedUrls.push(fileUploaded)
        }
      }
      return fileUploadedUrls
    } catch (error) {
      throw error;
    }
  }
  public static async deleteFiles2(urls: string[]) {
    try {
      for (const url of urls) {
        const urlSplit = url.split('/')
        const imageId = urlSplit[urlSplit.length - 1].split('.')[0];
        await cloudinary.uploader.destroy(imageId)
      }
      return
    } catch (err) {
      return {
        error: err
      }
    }
  }

  public static async cloneAttachment(attachment: ModelsAttributes.Attachment) {
    const file = await this.getFile(attachment.url)
    if (file) {
      const fileUploaded = await this.saveFile('attachments', file, attachment.fileName)
      fileUploaded.fileSize = attachment.fileSize
      fileUploaded.mimeType = attachment.mimeType
      return fileUploaded
    } else {
      const fileUploaded: FileUploaded = {
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        url: attachment.url,
        path: attachment.url.replace(process.env.BASE_URL, '')
      }
      return fileUploaded
    }
  }

  public static deleteFiles(urls: string[]) {
    try {
      urls.forEach(url => {
        if(!url.includes(process.env.BASE_URL)) return
        fs.unlinkSync(__dirname + `/../../..${url.replace(process.env.BASE_URL, '')}`);
      })
      return
    } catch (err) {
      return {
        error: err
      }
    }
  }

  public static async getFile(url: string) {
    try {
      if(!url.includes(process.env.BASE_URL)) return
      return fs.readFileSync(__dirname + `/../../..${url.replace(process.env.BASE_URL, '')}`);
    } catch (error) {
      throw error
    }
  }

  public static deleteFile(url: string) {
    try {
      if(!url.includes(process.env.BASE_URL)) return
      fs.unlinkSync(__dirname + `/../../..${url.replace(process.env.BASE_URL, '')}`);
      return;
    } catch (err) {
      return {
        error: err
      }
    }
  }

  public static moveFile(src: string, dest: string) {
    try {
      fs.mkdirSync(__dirname + `/../../../data/${path.dirname(dest)}`, { recursive: true });
      fs.renameSync(src, `data/${dest}`);
      return `data/${dest}`;
    } catch (err) {
      throw err
    }
  }
}

export default FileService;
