import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
export function NavBar({ username }: { username: string }) {
  const navigate = useNavigate();
  function signOut() {
    localStorage.removeItem("token");
    navigate("/signup");
  }

  return (
    <div className="flex justify-end  p-4 gap-8 font-google  w-full">
      <button className="hover:text-gray-400" onClick={signOut}>Sign Out</button>
      <div className="flex gap-2 justify-center cursor-pointer">
        <div>{username}</div>
        <User />
      </div>
    </div>
  );
}
