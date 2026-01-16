import { useState } from "react";
import axios from "axios";
import cube from "../assets/cube.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "./Loader";
import { Eye, EyeOff } from "lucide-react";
export default function Signin() {
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);


    const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  async function signin() {
    setLoading(true);
    if (!username.trim() || !password) return;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const signin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
        type: "user",
      });
      if (signin.status == 200) {
        setLoading(false);
        localStorage.setItem("token", signin.data.token);
        navigate("/home");
      } else {
        console.log("error signing in");
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
    return;
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
              Sign in to your account
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
              <div className="w-full flex justify-between  shadow-md rounded-lg  border border-gray-400/30 mt-1">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type={`${showPassword ? "text" : "password"}`}
                className="outline-none px-4 w-full py-2 bg-transparent"
                placeholder="••••••••"
              />
              <button
                onClick={togglePasswordVisibility}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  marginRight:"10px",
                  opacity:"70%"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              </div>
            </div>

            <div className="pt-6 flex justify-center">
              <button
                onClick={signin}
                className="bg-[#303030] w-full hover:bg-white transition duration-300 border-2 border-transparent hover:text-[#303030] hover:border-[#303030] py-2 text-white rounded-lg font-medium"
              >
                Sign in
              </button>
            </div>

            <div className="flex justify-center pt-4 text-center">
              <Link to={"/signup"}>
                <button className="text-sm font-medium text-gray-500 hover:text-black">
                  Dont have an account?
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block col-span-2 h-screen p-3">
        <div
          className="h-full bg-cover bg-center rounded-xl"
          style={{ backgroundImage: `url(${cube})` }}
        />
      </div>
    </div>
  );
}
