export default function Header() {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <div className="relative w-8 h-8">
        <div className="top-1.5 left-3 absolute bg-blue-500/90 border rounded-full w-5 h-5"></div>
        <div className="top-1.5 left-1 absolute bg-orange-500/90 border rounded-full w-5 h-5"></div>
      </div>
      <h1 className="text-2xl">Tailflare</h1>
    </div>
  );
}
