export function ClickToStart({ onStart }: { onStart: () => void }) {
  return (
    <div
      onClick={onStart}
      className="
        absolute inset-0 z-50 flex items-center justify-center
        bg-black/70 backdrop-blur-md
        cursor-pointer select-none
      "
    >
      <div className="text-center space-y-4 animate-fadeIn">
        <h1 className="text-5xl font-pixel text-white tracking-widest drop-shadow-lg">
          ARENA
        </h1>

        <div
          className="
            inline-block px-8 py-4
            border-2 border-cyan-400
            text-cyan-300 text-xl font-pixel
            rounded-xl
            shadow-[0_0_20px_rgba(34,211,238,0.6)]
            hover:shadow-[0_0_40px_rgba(34,211,238,1)]
            transition-all duration-300
            animate-pulse
          "
        >
          CLICK TO JOIN
        </div>

        <p className="text-xs text-gray-300 tracking-wide">
          Use ↑ ↓ ← → to move · Enter to chat
        </p>
      </div>
    </div>
  );
}
