import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] font-google">
      <div className="text-center px-6">
        {/* Big 404 */}
        <h1 className="text-[120px] font-bold text-white leading-none tracking-tight">
          404
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg mt-2">
          You’re lost in the void.
        </p>

        {/* Description */}
        <p className="text-gray-500 text-sm mt-1">
          The page you’re looking for doesn’t exist.
        </p>

        {/* Action */}
        <Link to="/">
          <button className="mt-8 px-6 py-2 rounded-lg bg-white text-black font-medium
            hover:bg-transparent hover:text-white border-2 border-transparent
            hover:border-white transition duration-300">
            Go back home
          </button>
        </Link>
      </div>
    </div>
  );
}
