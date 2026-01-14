import { useState } from "react";
import axios from "axios"
export default function Signup() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  async function signup() {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const signup =  await axios.post(`${BACKEND_URL}/api/v1/signup`,{
      username,
      password,
      type:"user"
    })
    return signup

  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className=" flex flex-col border border-black p-4 gap-6 rounded-2xl">
        <div className="text-2xl text-center ">Signup</div>
        <input
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          type="text"
          className="px-2 py-1 border focus:outline-none"
          placeholder="username"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          className="px-2 py-1 border focus:outline-none"
          placeholder="password"
        />
        <button onClick={signup} className="bg-blue-500 px-4 py-2 text-white cursor-pointer hover:bg-green-600 transition">
          Submit
        </button>
      </div>
    </div>
  );
}
