import type { ChatMessage } from "./Game";

import send from "../assets/send.svg";
import { TextMessage } from "./TextMessage";
import { useEffect, useRef } from "react";
export function ChatBox({
  messages,
  userId,
  onClick,
  onChange,
  selfUserId,
  onClose,
  val
}: {
  messages: Map<string, ChatMessage[]>;
  userId: string;
  onClick: () => void;
  onChange: (e: any) => void;
  selfUserId: string;
  onClose: () => void;
  val:string
}) {
  const userMessages = messages.get(userId) || [];

  //   if (!userMessages || userMessages.length === 0) return null;
  

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      <div
        className="mb-1 max-w-[160px]   bg-black rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-60  
 px-2 py-1 text-xs text-black shadow "
      >
        <div className="flex flex-col mb-1">
          {userMessages.slice(-3).map((m, i) => (
            <TextMessage
            key={i}
              userId={m.userId}
              text={m.chat}
              selfUserId={selfUserId}
            />
          ))}
        </div>
        <div className="flex justify-between ">
          <input
            ref={inputRef}
            onChange={onChange}
            onKeyDown={(e) => {
              e.stopPropagation();
              // e.preventDefault();
              if (e.key === "Escape") onClose();
              if (e.key === "Enter") onClick();
            }}
            type="text"
            value={val}
            className="w-[100px] bg-transparent text-white placeholder-white outline-none px-2 py-1"
            placeholder="Enter a message"
          />
          <button onClick={onClick} className="w-[40px]  flex justify-center">
            <img className="invert" width={"20"} src={send} alt="send" />
          </button>
        </div>
      </div>
    </div>
  );
}
