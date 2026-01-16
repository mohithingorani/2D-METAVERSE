import { useState } from "react";
import axios from "axios"
import cube from "../assets/cube.jpg"
import { Link, useNavigate } from "react-router-dom";
export default function Signin() {
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>("");
  async function signin() {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const signin =  await axios.post(`${BACKEND_URL}/api/v1/signin`,{
      username,
      password,
      type:"user"
    })
    
    if(signin.status==200){
        localStorage.setItem("token",signin.data.token);
        navigate("/home");
    }
    return;
  }


   return (
    <div className="grid grid-cols-4">
      <div className="col-span-2 ">
        <div className="flex h-full justify-center items-center font-google">
          <div className="px-6 py-4   ">
            <div className="pb-8 font-normal text-4xl ">
              Sign in to your account
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
              <button className="bg-[#303030] w-full hover:bg-white transition duration-300 hover:delay-75 border-2 border-transparent hover:text-[#303030] hover:border-2 hover:border-[#303030] py-2 text-white rounded-lg font-medium">
                Sign in
              </button>
            </div>
            <div className="flex justify-center pt-4  text-center">
              <Link to={"/signup"}>
              <button className="text-sm font-medium text-gray-500 hover:text-black">
                Dont have an account?
              </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-2 h-screen p-3">
        <div
          className=" h-full bg-cover bg-center rounded-xl "
          style={{ backgroundImage: `url(${cube})` }}
        ></div>
      </div>
    </div>
  );
}
