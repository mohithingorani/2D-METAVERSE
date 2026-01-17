export function DesktopOnly() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white text-center px-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Desktop Required</h1>
        <p className="text-gray-400">
          This game uses keyboard controls and is only supported on desktop.
        </p>
      </div>
    </div>
  );
}