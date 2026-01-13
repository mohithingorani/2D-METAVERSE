import { User } from "./UserManager";

export class RoomManager {
  rooms: Map<string, User[]> = new Map();
  static instance: RoomManager;

  private constructor() {
    this.rooms = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RoomManager();
    }
    return this.instance;
  }

  public removeUser(user: User, spaceId: string) {
    if (!this.rooms.has(spaceId)) {
      return;
    }
    this.rooms.set(
      spaceId,
      this.rooms.get(spaceId)?.filter((u) => user.id != u.id) ?? []
    );
    console.log("Removed User");
  }

  public addUser(spaceId:string,user:User){
    if(!this.rooms.has(spaceId)){
        return;
    }
    this.rooms.set(spaceId,[...(this.rooms.get(spaceId) ?? []),user])
  }

  public broadcast(message:any,user:User,spaceId:string){
    if(!this.rooms.has(spaceId)){
        return;
    }
    this.rooms.get(spaceId)?.forEach((u)=>{
        if(u.id!=user.id){
            u.send(message);
        }
    })
  }

}
