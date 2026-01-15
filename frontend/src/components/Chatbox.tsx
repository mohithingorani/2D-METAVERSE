import type { ChatMessage } from "./Game";

export function ChatBox({
  messages,
  userId,
  onClick,
  onChange
}: {
  messages: Map<string, ChatMessage[]>;
  userId: string;
  onClick:()=>void;
  onChange:()=>void
}) {
  const userMessages = messages.get(userId) || [];

  //   if (!userMessages || userMessages.length === 0) return null;

  return (
    <div className="mb-1 flex flex-col max-w-[160px] rounded bg-white px-2 py-1 text-xs text-black shadow">
      <div className="flex justify-between ">
        <input onChange={onChange} type="text" className="w-[100px] px-2 py-1" placeholder="Enter a message" />
        <button onClick={onClick} className="w-[60px]">send</button>
      </div>
      <div>
        {userMessages.slice(-3).map((m, i) => (
          <div key={i} className="leading-tight">
            {m.chat}
          </div>
        ))}
      </div>
    </div>
  );
}
