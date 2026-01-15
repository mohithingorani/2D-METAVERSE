import { WebSocket } from "ws";
import dotenv from "dotenv";
import axios from "axios";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RoomManager } from "./RoomManager";
import { timeStamp } from "node:console";

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
      console.log("ROOM STATE", RoomManager.getInstance().rooms);

      console.log(JSON.stringify(parsedData));
      switch (parsedData.type) {
        case "join":
          const spaceId = parsedData.payload.spaceId;
          const token = parsedData.payload.token;
          try {
            const decoded = jwt.verify(token, JWT_PASSWORD) as JwtPayload;
            this.userId = decoded.userId;
            console.log("JWT OK:", decoded);
          } catch (e) {
            console.log("JWT FAILED", e);
            this.ws.close();
            return;
          }

          this.spaceId = spaceId;
          RoomManager.getInstance().addUser(spaceId, this);
          this.x = Math.floor(Math.random() * (31 - 24 + 1)) + 24;
          this.y = Math.floor(Math.random() * (29 - 27 + 1)) + 27;
          console.log("reached 2");

          // sending current user along with all users on join with message name as space-joined
          this.send({
            type: "space-joined",
            payload: {
              userId: this.userId,
              spawn: {
                x: this.x,
                y: this.y,
              },
              users:
                RoomManager.getInstance()
                  .rooms.get(spaceId)
                  ?.filter((u) => u.id !== this.id)
                  .map((u) => ({
                    userId: u.userId,
                    x: u.x,
                    y: u.y,
                  })) || [],
            },
          });

          console.log("reached 3");
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
     
        case "chat": {
          if (!this.spaceId || !this.userId) return;

          const text = parsedData.payload?.message;
          if (typeof text !== "string" || !text.trim()) return;

          const users = RoomManager.getInstance().rooms.get(this.spaceId) || [];

          this.send({
            type:"chat",
            payload:{
              userId:this.userId,
              message:text,
              x:this.x,
              y:this.y,
              timeStamp:Date.now()
            }
          })

          users.forEach((u) => {
            const dx = u.x - this.x;
            const dy = u.y - this.y;

            // radius = 2 tiles
            if (dx * dx + dy * dy <= 4) {
              u.send({
                type: "chat",
                payload: {
                  userId: this.userId,
                  message: text,
                  x: this.x,
                  y: this.y,
                  timestamp: Date.now(),
                },
              });
            }
          });

          break;
        }
       

        case "move":
          const moveX = parsedData.payload.x;
          const moveY = parsedData.payload.y;
          const xDisplacement = Math.abs(this.x - moveX);
          const yDisplacement = Math.abs(this.y - moveY);
          console.log("reached 4");
          const isInside = moveX >= 1 && moveY >= 1 && moveX < 54 && moveY < 30;
          if (
            isInside &&
            ((xDisplacement == 1 && yDisplacement == 0) ||
              (xDisplacement == 0 && yDisplacement == 1))
          ) {
            this.x = moveX;
            this.y = moveY;
            RoomManager.getInstance().broadcast(
              {
                type: "movement",
                payload: {
                  userId: this.userId,
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
