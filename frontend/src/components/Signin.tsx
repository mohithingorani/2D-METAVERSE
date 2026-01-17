import { useEffect, useState } from "react";
import axios from "axios";
import cube from "../assets/cube.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "./Loader";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

export default function Signin() {
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [failedValidation, setFailedValidation] = useState<boolean>(true);

  const navigate = useNavigate();

  const successNotify = (message: string) =>
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

  useEffect(() => {
    const isFailed = !username || !username.trim() || !password;
    setFailedValidation(isFailed);
  }, [username, password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function signin() {
    if (failedValidation) return;

    setLoading(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
        type: "user",
      });

      if (res.status === 200) {
        successNotify("Signed in successfully");
        localStorage.setItem("token", res.data.token);
        setLoading(false);
        navigate("/game");
      }
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        errorNotify(err.response?.data?.message || "Invalid credentials");
      } else {
        errorNotify("Unexpected error");
      }
    }
  }

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
        <div className="flex h-full justify-center items-center font-google px-4">
          <div className="px-6 py-4 w-full max-w-md">
            <div className="pb-8 text-4xl text-center md:text-left">
              Sign in to your account
            </div>

            {/* Username */}
            <div className="mb-3">
              <div className="text-sm">Username</div>
              <input
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="w-full px-4 py-2 shadow-md rounded-lg outline-none border border-gray-400/30 mt-1"
                placeholder="hexnova"
              />
              {username !== null && !username.trim() && (
                <div className="ml-2 mt-1 text-red-600">
                  username cannot be empty
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="text-sm">Password</div>
              <div className="w-full flex justify-between shadow-md rounded-lg border border-gray-400/30 mt-1">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="outline-none px-4 w-full py-2 bg-transparent"
                  placeholder="••••••••"
                />
                <button
                  onClick={togglePasswordVisibility}
                  className="mr-3 opacity-70"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {password !== null && !password.trim() && (
                <div className="ml-2 mt-1 text-red-600">
                  password cannot be empty
                </div>
              )}
            </div>

            {/* Button */}
            <div className="pt-6">
              <button
                onClick={signin}
                disabled={failedValidation}
                className={`w-full py-2 rounded-lg font-medium text-white bg-[#303030]
                ${
                  failedValidation
                    ? "cursor-not-allowed bg-opacity-45"
                    : "hover:bg-white hover:text-[#303030] hover:border-[#303030] border-2 border-transparent transition"
                }`}
              >
                Sign in
              </button>
            </div>

            <div className="flex justify-center pt-4">
              <Link to="/signup">
                <button className="text-sm font-medium text-gray-500 hover:text-black">
                  Don’t have an account?
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className="hidden md:block col-span-2 h-screen p-3">
        <div
          className="h-full bg-cover bg-center rounded-xl"
          style={{ backgroundImage: `url(${cube})` }}
        />
      </div>
    </div>
  );
}
