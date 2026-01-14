import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {  
    const navigate = useNavigate();
    const [spaceId, setSpaceId] = useState<string>("");
    function joinGame(){
        navigate(`/game?spaceId=${spaceId}`)
    }
  return (
    <div className="flex justify-center items-center h-screen">
      <div className=" flex flex-col border border-black p-4 gap-6 rounded-2xl">
        <div className="text-2xl text-center ">JOIN SPACE</div>
        <input
        onChange={e=>setSpaceId(e.target.value)}
          type="text"
          className="px-2 py-1 border focus:outline-none"
          placeholder="SPACE ID"
        />
        <button onClick={joinGame}  className="bg-blue-500 px-4 py-2 text-white cursor-pointer hover:bg-green-600 transition">
          Submit
        </button>
      </div>
    </div>
  );
}
