import { User } from "lucide-react";
export function NavBar({ username }: { username: string }) {
  return (
    <div className="flex justify-end p-4 gap-3  w-full">
      <div>{username}</div>
      <User />
    </div>
  );
}
