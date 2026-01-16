import { useEffect, useState } from "react";
import axios from "axios";
import bg2 from "../assets/bg2.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "./Loader";
export default function Signup() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  async function signup() {
    if (!username.trim() || !password) return;
    setLoading(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      const signup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: "user",
      });

      if (signup.status == 200) {
        localStorage.setItem("token", signup.data.token);
        navigate("/home");
        return;
      } else {
        console.log("Error signing up");
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }


return (
  <div className="grid grid-cols-1 md:grid-cols-4 min-h-screen">
    {loading && (
      <div className="fixed inset-0 bg-white/5 flex justify-center items-center z-50">
        <Loader size={40} />
      </div>
    )}

    <div className="col-span-1 md:col-span-2">
      <div className="flex h-full justify-center items-center font-google px-4">
        <div className="px-6 py-4 w-full max-w-md">
          <div className="pb-8 font-normal text-4xl text-center md:text-left">
            Create your account
          </div>

          <div className="mb-3">
            <div className="text-sm">Username</div>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full px-4 py-2 shadow-md rounded-lg outline-none border border-gray-400/30 mt-1"
              placeholder="hexnova"
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
              className="bg-[#303030] w-full hover:bg-white transition duration-300 border-2 border-transparent hover:text-[#303030] hover:border-[#303030] py-2 text-white rounded-lg font-medium"
            >
              Create account
            </button>
          </div>

          <div className="flex justify-center pt-4 text-center">
            <Link to={"/signin"}>
              <button className="text-sm font-medium text-gray-500 hover:text-black">
                Already have an account?
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>

    <div className="hidden md:block col-span-2 h-screen p-3">
      <div
        className="h-full bg-cover bg-center rounded-xl"
        style={{ backgroundImage: `url(${bg2})` }}
      />
    </div>
  </div>
);

}
