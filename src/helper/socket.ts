// import http from "http";
// import { Server, Socket } from "socket.io";

// export enum Action {
//   Create = 0,
//   Update = 1,
//   Delete = 2,
// }

// export enum ObjectTypeId {
//   NOTIFY = 1,
// }

// export interface ResponseSocket {
//   data?: any,
//   action: Action,
//   objectId?: number,
//   objectTypeId?: number
// }

// export class SocketService {
//   io: Server;
//   constructor(server: http.Server) {
//     this.io = new Server(server, {
//       cors: {
//         origin: '*'
//       }
//     });
//     this.io.on('connection', async (socket: Socket) => {
//       console.log('user connected');
//       socket.on('disconnect', async function () {
//         console.log('user disconnected');
//       })
//     })
//   }

//   emit(event: string, body: ResponseSocket) {
//     return this.io.emit(event, body);
//   }
// }