import { WebSocket } from "ws";
import dotenv from "dotenv"
import axios from "axios"
import jwt, { JwtPayload } from "jsonwebtoken";
import { RoomManager } from "./RoomManager";

dotenv.config();
function generateRandomString(num: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const BACKEND_URL = process.env.BACKEND_URL as string;
const JWT_PASSWORD = process.env.JWT_PASSWORD as string;
type SpaceType = {
    width:number,
    height:number
}

export class User {
  public id: string;
  public userId?: string;
  private ws: WebSocket;
  private x: number;
  private y: number;
  private spaceId?: string;

  constructor(ws: WebSocket) {
    this.id = generateRandomString(10);
    this.ws = ws;
    this.x = 0;
    this.y = 0;
    this.initHandlers();
  }

  send(message: any) {
    this.ws.send(JSON.stringify(message));
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      const parsedData = JSON.parse(data.toString());
      console.log(JSON.stringify(parsedData));
      switch (parsedData.type) {
        case "join":
          const spaceId = parsedData.payload.spaceId;
          const token = parsedData.payload.token;
          const userId = (jwt.verify(token, JWT_PASSWORD) as JwtPayload).userId;
          if (!userId) {
            this.ws.close();
            return;
          }     

          this.userId = userId;
        //   const space = await axios.get<SpaceType>(
        //     `${BACKEND_URL}/api/v1/ws/space?spaceId=${spaceId}`
        //   );
        //   if (space.status != 200 || !space) {
        //     this.ws.close();
        //     return;
        //   }
          this.spaceId = spaceId;
          RoomManager.getInstance().addUser(spaceId, this);
          this.x = Math.floor(Math.random() * 400);
          this.y = Math.floor(Math.random() * 400);
          console.log("reached 2");
          this.send({
            type: "space-joined",
            payload: {
              spawn: {
                x: this.x,
                y: this.y,
              },
              users: RoomManager.getInstance()
                .rooms.get(spaceId)
                ?.filter((u) => {
                  u.id != this.id;
                })
                .map((u) => ({ id: u.id })),
            },
          });
          console.log("reached 3")
          RoomManager.getInstance().broadcast(
            {
              type: "user-joined",
              payload: {
                userId: this.userId,
                x: this.x,
                y: this.y,
              },
            },
            this,
            this.spaceId!
          );
          break;
        case "move":
          const moveX = parsedData.payload.x;
          const moveY = parsedData.payload.y;
          const xDisplacement = Math.abs(this.x - moveX);
          const yDisplacement = Math.abs(this.y - moveY);
          console.log("reached 4");
          if (
            (xDisplacement == 1 && yDisplacement == 0) ||
            (xDisplacement == 0 && yDisplacement == 1)
          ) {
            this.x = moveX;
            this.y = moveY;
            RoomManager.getInstance().broadcast(
              {
                type: "movement",
                payload: {
                  x: this.x,
                  y: this.y,
                },
              },
              this,
              this.spaceId!
            );
            return;
          }
          this.send({
            type: "movement-rejected",
            payload: {
              x: this.x,
              y: this.y,
            },
          });
      }
    });
  }
  destroy() {
    RoomManager.getInstance().broadcast(
      {
        type: "user-left",
        payload: {
          userId: this.userId,
        },
      },
      this,
      this.spaceId!
    );
    RoomManager.getInstance().removeUser(this, this.spaceId!);
  }
}
