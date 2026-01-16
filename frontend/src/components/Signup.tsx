import { useState } from "react";
import axios from "axios";
import bg2 from "../assets/bg2.jpg";
import { Link } from "react-router-dom";
import { Loader } from "./Loader";
export default function Signup() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  async function signup() {
    setLoading(true);
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
      {loading && (
        <div className="absolute bg-white/5 flex w-full h-full justify-center items-center">
          <Loader size={40} />
        </div>
      )}
      <div className="col-span-2 ">
        <div className="flex h-full justify-center items-center font-google">
          <div className="px-6 py-4   ">
            <div className="pb-8 font-normal text-4xl ">
              Create your account
            </div>
            <div className="mb-3">
              <div className="text-sm">Email</div>
              <input
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                type="text"
                className="w-full px-4 py-2 shadow-md rounded-lg outline-none border border-gray-400/30 mt-1"
                placeholder="name@email.com"
              />
            </div>
            <div>
              <div className="text-sm">Password</div>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full px-4 py-2 shadow-md rounded-lg outline-none border border-gray-400/30 mt-1"
                placeholder="••••••••"
              />
            </div>
            <div className="pt-6 flex justify-center">
              <button
                onClick={signup}
                className="bg-[#303030] w-full hover:bg-white transition duration-300 hover:delay-75 border-2 border-transparent hover:text-[#303030] hover:border-2 hover:border-[#303030] py-2 text-white rounded-lg font-medium"
              >
                Create account
              </button>
            </div>
            <div className="flex justify-center pt-4  text-center">
              <Link to={"/signin"}>
                <button className="text-sm font-medium text-gray-500 hover:text-black">
                  Already have an account?
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-2 h-screen p-3">
        <div
          className=" h-full bg-cover bg-center rounded-xl "
          style={{ backgroundImage: `url(${bg2})` }}
        ></div>
      </div>
    </div>
  );
}
