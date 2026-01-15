import { useEffect, useRef, useState } from "react";
import { lerp } from "../utility/lerp";
import { clamp } from "../utility/clamp";
import { isNear } from "../utility/distance";
import { ChatBox } from "./Chatbox";
import { ClickToStart } from "./ClickToStart";

interface UserInterface {
  userId: string;
  x: number;
  y: number;
}
export interface ChatMessage {
  userId: string;
  chat: string;
}

const Arena = () => {
  const canvasRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [users, setUsers] = useState<Map<string, UserInterface>>(new Map());
  const [renderUsers, setRenderUsers] = useState<Map<string, any>>(new Map());
  const [params, setParams] = useState({ token: "", spaceId: "" });
  const [renderPos, setRenderPos] = useState({ x: 0, y: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  type Direction = "up" | "down" | "left" | "right";
  type AnimState = "idle" | "walk";
  const isMovingRef = useRef(false);
  const directionRef = useRef<Direction>("down");
  const animStateRef = useRef<AnimState>("idle");
  const frameIndexRef = useRef(0);
  const wsReadyRef = useRef(false);
  const [animationReady, setAnimationReady] = useState(false);
  const [message, setCurrentMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Map<string, ChatMessage[]>>(
    new Map()
  );

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

  // whenever all users changes, we manually copy it to ref (including yourself)
  useEffect(() => {
    currentUserRef.current = currentUser;
    usersRef.current = users;
  }, [users, currentUser]);

  useEffect(() => {
    let id: number;

    const animate = () => {
      const anim = animationsRef.current;
      if (anim) {
        if (animStateRef.current === "walk") {
          const frames = anim.walk[directionRef.current];
          frameIndexRef.current =
            (frameIndexRef.current + 0.15) % frames.length;
        } else {
          // idle animation (no direction)
          frameIndexRef.current =
            (frameIndexRef.current + 0.05) % anim.idle.length;
        }
      }

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
      wsReadyRef.current = true;

      wsRef.current.send(
        JSON.stringify({
          type: "join",
          payload: { spaceId, token },
        })
      );
    };

    wsRef.current.onmessage = (event: any) => {
      handleWebSocketMessage(JSON.parse(event.data));
    };
    return () => {
      wsReadyRef.current = false;
      wsRef.current?.close();
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
        setLogs((prev) => [...prev.slice(-10), "You joined the space!"]);

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
        setLogs((prev) => [
          ...prev.slice(-10),
          `${message.payload.userId} joined the space!!`,
        ]);
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
      case "chat": {
        const text = message.payload.message;
        const fromUserId = message.payload.userId;

        setChatMessages((prev) => {
          const next = new Map(prev);
          const existing = next.get(fromUserId) || [];

          next.set(fromUserId, [
            ...existing,
            { userId: fromUserId, chat: text },
          ]);

          return next;
        });

        break;
      }
    }
  };

  const handleSendMessage = (userId: string) => {
    if (!message.trim()) return;

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: { message },
      })
    );

    setChatMessages((prev) => {
      const next = new Map(prev);
      const existing = next.get(userId) || [];
      next.set(userId, [
        ...existing,
        { userId: currentUserRef.current.userId, chat: message },
      ]);
      return next;
    });

    setCurrentMessage("");
  };
  const focusGame = () => {
    requestAnimationFrame(() => {
      containerRef.current?.focus();
    });
  };

  // Handle user movement
  const handleMove = (newX: number, newY: number) => {
    if (!wsRef.current || !wsReadyRef.current) return;

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

  const animationsRef = useRef<{
    idle: HTMLImageElement[];
    walk: Record<Direction, HTMLImageElement[]>;
  } | null>(null);

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      const idle = await Promise.all([
        loadImage("/still/still_01.png"),
        loadImage("/still/still_02.png"),
        loadImage("/still/still_03.png"),
        loadImage("/still/still_04.png"),
      ]);

      const up = await Promise.all([
        loadImage("/walk/up/up_01.png"),
        loadImage("/walk/up/up_02.png"),
        loadImage("/walk/up/up_03.png"),
        loadImage("/walk/up/up_04.png"),
      ]);

      const left = await Promise.all([
        loadImage("/walk/left/left_01.png"),
        loadImage("/walk/left/left_02.png"),
        loadImage("/walk/left/left_03.png"),
        loadImage("/walk/left/left_04.png"),
        loadImage("/walk/left/left_05.png"),
        loadImage("/walk/left/left_06.png"),
        loadImage("/walk/left/left_07.png"),
      ]);

      const right = await Promise.all([
        loadImage("/walk/right/right_01.png"),
        loadImage("/walk/right/right_02.png"),
        loadImage("/walk/right/right_03.png"),
        loadImage("/walk/right/right_04.png"),
        loadImage("/walk/right/right_05.png"),
      ]);

      if (cancelled) return;

      animationsRef.current = {
        idle,
        walk: {
          up,
          down: idle,
          left,
          right,
        },
      };
      setAnimationReady(true);

      setLoading(false);
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Draw arena
  useEffect(() => {
    if (loading || !animationReady) return;
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
      const anim = animationsRef.current;
      if (!anim) return;

      let frame: HTMLImageElement;

      if (animStateRef.current === "walk") {
        const frames = anim.walk[directionRef.current];
        frame = frames[Math.floor(frameIndexRef.current)];
      } else {
        frame = anim.idle[Math.floor(frameIndexRef.current)];
      }

      const SIZE = 70;
      const scale = TILE_SIZE;
      if (!frame.complete) return;

      ctx.drawImage(
        frame,
        renderPos.x * scale - SIZE / 2,
        renderPos.y * scale - SIZE / 2,
        SIZE,
        SIZE
      );
      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";

      ctx.fillText(
        "You",
        renderPos.x * TILE_SIZE,
        renderPos.y * TILE_SIZE - SIZE / 2 - 10
      );
    }

    // DRAW OTHER USERS
    renderUsers.forEach((user) => {
      if (user.x === undefined) return;
      const frame =
        animationsRef.current!.idle[
          Math.floor(frameIndexRef.current) % animationsRef.current!.idle.length
        ];
      const sprite = spriteRef.current;
      if (!sprite) return;

      const scale = TILE_SIZE;
      const SIZE = 70;

      ctx.drawImage(
        frame,
        user.x * TILE_SIZE - SIZE / 2,
        user.y * TILE_SIZE - SIZE / 2,
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

  const closeChat = () => {
    setActiveChatUserId(null);
    focusGame();
  };
  const [hasStarted, setHasStarted] = useState(false);

  const startGame = () => {
    setHasStarted(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // throttling, rate limittin - limiting how fast movement can happen
    // allow movement only once every 16ms
    if(!hasStarted) return;
    if (activeChatUserId) return;

    const now = Date.now();
    if (now - lastMove.current < 100) return;
    lastMove.current = now;

    const { x, y } = currentUser;
    if (x === undefined) return;

    switch (e.key) {
      case "ArrowUp":
        isMovingRef.current = true;
        directionRef.current = "up";
        animStateRef.current = "walk";
        handleMove(x, y - 1);
        break;

      case "ArrowDown":
        isMovingRef.current = true;
        directionRef.current = "down";
        animStateRef.current = "walk";
        handleMove(x, y + 1);
        break;

      case "ArrowLeft":
        isMovingRef.current = true;
        directionRef.current = "left";
        animStateRef.current = "walk";
        handleMove(x - 1, y);
        break;

      case "ArrowRight":
        isMovingRef.current = true;
        directionRef.current = "right";
        animStateRef.current = "walk";
        handleMove(x + 1, y);
        break;

      case "Enter": {
        if (nearbyUsers.length > 0) {
          setActiveChatUserId(nearbyUsers[0].userId);
        }
        break;
      }
    }
  };
  // useEffect(() => {
  //   const t = setTimeout(() => {
  //     animStateRef.current = "idle";
  //     frameIndexRef.current = 0;
  //   }, 120);

  //   return () => clearTimeout(t);
  // }, [currentUser.x, currentUser.y]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     usersRef.current.forEach((u) => {
  //       if (isNear(currentUserRef.current, u)) {
  //         console.log("You are near");
  //         const screenX = currentUserRef.current.x * TILE_SIZE - cameraRef.current.x;
  //   const screenY = currentUserRef.cu.y * TILE_SIZE - cameraRef.current.y;
  //       }
  //     });
  //   }, 2000);

  //   return () => clearInterval(interval);
  // }, []);
  const nearbyUsers = Array.from(renderUsers.values()).filter(
    (u) => currentUser?.x && isNear(currentUser, u)
  );

  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

  useEffect(() => {
  if (hasStarted) {
    requestAnimationFrame(() => {
      containerRef.current?.focus();
    });
  }
}, [hasStarted]);
  useEffect(() => {
    const onKeyUp = () => {
      isMovingRef.current = false;
      animStateRef.current = "idle";
      frameIndexRef.current = 0;
    };

    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, []);

  // if user2 walks away, bring back focus

  useEffect(() => {
    if (
      activeChatUserId &&
      !nearbyUsers.find((u) => u.userId === activeChatUserId)
    ) {
      closeChat();
    }
  }, [nearbyUsers]);
  if (
    loading ||
    !wsReadyRef.current ||
    !animationReady ||
    !currentUserRef.current
  ) {
    return <div>loading</div>;
  }

  return (
    <div className="h-screen w-full text-white bg-gray-900">
      {!hasStarted && <ClickToStart onStart={startGame} />}
      {/* rest of arena */}
      <div
        className="p-8 outline-none"
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <h1 className="text-2xl font-bold mb-4 ">Arena</h1>
        <div className="mb-4">
          {/* <p className="text-sm text-gray-600">Token: {params.token}</p> */}
          <p className="text-xs text-gray-600">Space ID: {params.spaceId}</p>
          <p className="text-xs text-gray-600">
            Loading: {JSON.stringify(loading)}
          </p>
          <p className="text-sm text-gray-600">
            Connected Users: {users.size + (currentUser ? 1 : 0)}
          </p>
        </div>
        <div>Messages:{JSON.stringify(logs)}</div>
        <div className=" rounded-2xl border-2 relative border-blue-800 shadow-lg shadow-blue-500/50 w-fit overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1080}
            height={603}
            className="bg-blue-400"
          />
          {nearbyUsers.map((user) => {
            const screenX = user.x * TILE_SIZE - cameraRef.current.x || 0;
            const screenY = user.y * TILE_SIZE - cameraRef.current.y || 0;

            return (
              <div
                key={user.userId}
                className="absolute"
                style={{
                  left: screenX,
                  top: screenY - 40,
                  transform: "translate(-50%, -100%)",
                }}
              >
                {activeChatUserId === user.userId && (
                  <ChatBox
                  val={message}
                    selfUserId={currentUserRef.current.userId}
                    userId={user.userId}
                    messages={chatMessages}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onClick={() => {
                      handleSendMessage(user.userId);
                    }}
                    onClose={() => {
                      closeChat();
                    }}
                  />
                )}
                {!activeChatUserId && (
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded font-pixel">
                    Press Enter to chat
                  </div>
                )}
              </div>
            );
          })}
          <div className="absolute text-3xl top-4 left-4 font-pixel px-1 bg-black/40 text-white">
            XY : {currentUser.x}, {currentUser.y}
          </div>
          <div
            className={`absolute bottom-4 left-4 font-pixel  max-h-10 bg-black/40`}
          >
            {logs.map((message: string, key) => {
              return (
                <div key={key} className=" text-white">
                  {message}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2  text-sm text-gray-500">
          Use arrow keys to move your avatar
        </p>
      </div>
    </div>
  );
};

export default Arena;
