import { UserAttributes } from "../../database/models/users";
// import { SocketService } from "helper/socket";
import { CustomSuccess, Error } from "helper/response";
import { Config } from 'models/config';

declare global {
  namespace Express {
    export interface Response {
      onSuccess: (data: any, custom?: CustomSuccess) => any;
      onError: (error: Error) => any;
      configs: Config
    }
    export interface Request {
      configs: Config
    }
    // export interface Application {
    //   socketService: SocketService
    // }
    export interface User extends UserAttributes {}
  }
}

export {};
