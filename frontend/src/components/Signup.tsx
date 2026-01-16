import { useState } from "react";
import axios from "axios";
import game from "../assets/game.avif";
import cube from "../assets/cube.jpg";
export default function Signup() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  async function signup() {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const signup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "user",
    });
    return signup;
  }

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-2 ">
        {/* <div className="flex justify-center items-center h-screen">
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
            <button
              onClick={signup}
              className="bg-blue-500 px-4 py-2 text-white cursor-pointer hover:bg-green-600 transition"
            >
              Submit
            </button>
          </div>
        </div> */}
        <div className="flex h-full justify-center items-center font-google">
          <div className="px-6 py-4   ">
            <div className="pb-8 font-normal text-4xl ">
              Create your account
            </div>
            <div className="mb-3">
              <div className="text-sm">Email</div>
              <input
                type="text"
                className="w-full px-4 py-2 shadow-md rounded-lg outline-none border border-gray-400/30 mt-1"
                placeholder="name@email.com"
              />
            </div>
            <div>
              <div className="text-sm">Password</div>
              <input
                type="password"
                className="w-full px-4 py-2 shadow-md rounded-lg outline-none border border-gray-400/30 mt-1"
                placeholder="••••••••"
              />
            </div>
            <div className="pt-6 flex justify-center">
              <button className="bg-[#303030] w-full py-2 text-white rounded-lg font-medium">
                Create account
              </button>
            </div>
            <div className="flex justify-center pt-4 text-sm font-medium text-gray-500">
              <div>Already have an account?</div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="col-span-2 h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${cube})` }}
      ></div>
    </div>
  );
}
