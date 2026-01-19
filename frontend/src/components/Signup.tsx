import { useEffect, useState } from "react";
import axios from "axios";
import bg2 from "../assets/bg2.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "./Loader";
import { Eye, EyeOff} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { delay } from "../utils/delay";
export default function Signup() {
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [failedValidation, setFailedValidation] = useState<boolean>(true);
  const sucessNotify = (message: string) =>
    toast.success(message, {
      pauseOnHover: false,
      closeButton: false,
      autoClose: 1500,
      hideProgressBar: true,
      position: "bottom-right",
    });
  const errorNotify = (message: string) =>
    toast.error(message, {
      pauseOnHover: false,
      closeButton: false,
      autoClose: 1500,
      hideProgressBar: true,
      position: "bottom-right",
    });
  const navigate = useNavigate();

  useEffect(() => {
    const isFailed = !password || password.length < 8 || !username;
    setFailedValidation(isFailed);
  }, [password, username]);

  async function signup() {
    if (!username || !username.trim() || !password) return;
    setLoading(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      const signup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: "user",
      });

      if (signup.status == 200) {
        sucessNotify(signup.data.message);
        await delay(2000);
        localStorage.setItem("token", signup.data.token);
        setLoading(false);
        navigate("/game");
        return;
      } else {
        setLoading(false);
        errorNotify(signup.data.message);
        console.log("Error signing up");
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      if (axios.isAxiosError(err)) {
        errorNotify(err.response?.data?.message || "Something went wrong");
      } else {
        errorNotify("Unexpected error");
      }
    }
  }
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 min-h-screen">
      <div className="absolute">
        <ToastContainer />
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-white/5 flex justify-center items-center z-50">
          <Loader size={40} />
        </div>
      )}

      <div className="col-span-1 md:col-span-2">
        <div className="flex h-full justify-center items-center font-google px-4 bg-slate-100 md:bg-white">
          <div className="px-6 py-16 border border-black shadow-md border-1 bg-white rounded-md md:border-0 md:shadow-none w-full max-w-md">
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
              <div className="ml-2 mt-1 text-red-600">
                {username != null && !username.trim() && (
                  <div>username can not be empty</div>
                )}
              </div>
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
                    marginRight: "10px",
                    opacity: "70%",
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="ml-2 mt-1 text-red-600">
                {password != null && !password.trim() && (
                  <div>password can not be empty</div>
                )}

                {password != null && password.length < 8 && (
                  <div>password should be at least 8 characters long</div>
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-center">
              <button
                onClick={signup}
                disabled={failedValidation}
                className={`bg-[#303030] ${failedValidation && "cursor-not-allowed bg-opacity-45 select-none"} w-full  ${!failedValidation && "cursor-pointer hover:bg-white transition duration-300 border-2 border-transparent hover:text-[#303030] hover:border-[#303030]"} py-2 text-white rounded-lg font-medium`}
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
