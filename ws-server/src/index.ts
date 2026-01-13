import { WebSocketServer } from 'ws';
import { User } from './UserManager';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log("Ws connected");
  ws.on('error', console.error);
  let user = new User(ws);

  ws.on('error',console.error);

  ws.on("close",()=>{
    user.destroy();
  });
});