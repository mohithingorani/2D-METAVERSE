import { useEffect, useRef, useState } from "react";
import { lerp } from "../utility/lerp";
import { clamp } from "../utility/clamp";

interface UserInterface {
  userId: string;
  x: number;
  y: number;
}

const Arena = () => {
  const canvasRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [users, setUsers] = useState<Map<string, UserInterface>>(new Map());
  const [renderUsers, setRenderUsers] = useState<Map<string, any>>(new Map());
  const [params, setParams] = useState({ token: "", spaceId: "" });
  const [renderPos, setRenderPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const TILE_SIZE = 40;
  const WORLD_WIDTH = 54 * TILE_SIZE;
  const WORLD_HEIGHT = 30 * TILE_SIZE;
  const cameraRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = "/still/still_01.png"; // put sprite in public/
    spriteRef.current = img;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/map-final.png";
    bgImgRef.current = img;
  }, []);

  const currentUserRef = useRef(currentUser);
  const usersRef = useRef(users);

  // whenever current user changes, we manually copy it to ref
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // whenever all users changes, we manually copy it to ref
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    let id: number;

    const animate = () => {
      // copy currentuser from its ref
      const cu = currentUserRef.current;

      setRenderPos((prev) => ({
        x: lerp(prev.x, cu.x, 0.25),
        y: lerp(prev.y, cu.y, 0.25),
      }));

      setRenderUsers((prev) => {
        const next = new Map(prev);

        usersRef.current.forEach((user, id) => {
          const p = next.get(id) || user;
          next.set(id, {
            userId: user.userId,
            x: lerp(p.x, user.x, 0.25),
            y: lerp(p.y, user.y, 0.25),
          });
        });

        return next;
      });

      id = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(id);
  }, []);

  // Initialize WebSocket connection and handle URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = localStorage.getItem("token");
    const spaceId = urlParams.get("spaceId") || "";
    token && setParams({ token, spaceId });

    // Initialize WebSocket
    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onopen = () => {
      // Join the space once connected
      wsRef.current.send(
        JSON.stringify({
          type: "join",
          payload: {
            spaceId,
            token,
          },
        })
      );
    };

    // whenever client ws recieves a message
    wsRef.current.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };
  }, []);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "space-joined":
        // Initialize current user position and other users
        console.log("set");

        console.log({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.userId,
        });
        setCurrentUser({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.userId,
        });
        setRenderPos({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
        });

        // Initialize other users from the payload
        // map stores like this userid:{userId,x,y}
        const userMap = new Map();
        const users: UserInterface[] = message.payload.users;
        users.forEach((user: UserInterface) => {
          userMap.set(user.userId, user);
        });
        setUsers(userMap);
        break;

      case "user-joined":
        setUsers((prev) => {
          const newUsers = new Map(prev);
          newUsers.set(message.payload.userId, {
            x: message.payload.x,
            y: message.payload.y,
            userId: message.payload.userId,
          });
          return newUsers;
        });
        break;
      case "movement":
        setUsers((prev) => {
          const next = new Map(prev);
          next.set(message.payload.userId, {
            userId: message.payload.userId,
            x: message.payload.x,
            y: message.payload.y,
          });
          return next;
        });
        break;

      case "movement-rejected":
        // Reset current user position if movement was rejected
        setCurrentUser((prev: any) => ({
          ...prev,
          x: message.payload.x,
          y: message.payload.y,
        }));
        break;

      case "user-left":
        setUsers((prev) => {
          const newUsers = new Map(prev);
          newUsers.delete(message.payload.userId);
          return newUsers;
        });
        break;
    }
  };

  // Handle user movement
  const handleMove = (newX: number, newY: number) => {
    newX = clamp(newX, 1, 53);
    newY = clamp(newY, 1, 29);
    setCurrentUser((prev: any) => ({
      ...prev,
      x: newX,
      y: newY,
    }));

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: newX,
          y: newY,
          userId: currentUser.userId,
        },
      })
    );
  };
  // Draw arena
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const viewWidth = canvas.width;
    const viewHeight = canvas.height;

    // center camera on player
    cameraRef.current.x = renderPos.x * TILE_SIZE - viewWidth / 2;
    cameraRef.current.y = renderPos.y * TILE_SIZE - viewHeight / 2;

    // clamp camera so it doesn't show outside map
    cameraRef.current.x = clamp(
      cameraRef.current.x,
      0,
      WORLD_WIDTH - viewWidth
    );

    cameraRef.current.y = clamp(
      cameraRef.current.y,
      0,
      WORLD_HEIGHT - viewHeight
    );
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // move world opposite to camera
    ctx.translate(-cameraRef.current.x, -cameraRef.current.y);
    const bg = bgImgRef.current;
    if (bg) {
      ctx.drawImage(bg, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }

    if (currentUser.x !== undefined) {
      const sprite = spriteRef.current;

      if (sprite) {
        const scale = TILE_SIZE;
        const SIZE = 70;

        ctx.drawImage(
          sprite,
          renderPos.x * scale - SIZE / 2,
          renderPos.y * scale - SIZE / 2,
          SIZE,
          SIZE
        );

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText("You", renderPos.x * scale, renderPos.y * scale - 24);
      }
    }

    // ===== DRAW OTHER USERS =====
    renderUsers.forEach((user) => {
      if (user.x === undefined) return;

      const sprite = spriteRef.current;
      if (!sprite) return;

      const scale = 20;
      const SIZE = 32;

      ctx.drawImage(
        sprite,
        user.x * scale - SIZE / 2,
        user.y * scale - SIZE / 2,
        SIZE,
        SIZE
      );

      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText(`User ${user.userId}`, user.x * scale, user.y * scale - 24);
    });
    ctx.restore();
  }, [renderUsers, renderPos]);

  const lastMove = useRef(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // throttling, rate limittin - limiting how fast movement can happen
    // allow movement only once every 16ms
    const now = Date.now();
    if (now - lastMove.current < 60) return;
    lastMove.current = now;

    const { x, y } = currentUser;
    if (x === undefined) return;

    switch (e.key) {
      case "ArrowUp":
        handleMove(x, y - 1);
        break;
      case "ArrowDown":
        handleMove(x, y + 1);
        break;
      case "ArrowLeft":
        handleMove(x - 1, y);
        break;
      case "ArrowRight":
        handleMove(x + 1, y);
        break;
    }
  };

  return (
    <div
      className="p-8 bg-green-300 "
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h1 className="text-2xl font-bold mb-4 ">Arena</h1>
      <div className="mb-4">
        {/* <p className="text-sm text-gray-600">Token: {params.token}</p> */}
        <p className="text-xs text-gray-600">Space ID: {params.spaceId}</p>
        <p className="text-sm text-gray-600">
          Connected Users: {users.size + (currentUser ? 1 : 0)}
        </p>
      </div>
      <div className=" rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1080}
          height={603}
          className="bg-blue-400"
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Use arrow keys to move your avatar
      </p>
    </div>
  );
};

export default Arena;
