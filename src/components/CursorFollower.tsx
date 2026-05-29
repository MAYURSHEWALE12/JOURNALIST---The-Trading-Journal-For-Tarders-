import { useApp } from '../context/AppContext';

export default function CursorFollower() {
  const { isDarkMode, showCursorFollower, mousePos, candleHeight } = useApp();

  if (!showCursorFollower) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 hidden md:flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${mousePos.x}px`,
        top: `${mousePos.y}px`,
        height: '32px',
        width: '16px',
      }}
    >
      <div className={`absolute w-[1.5px] h-[26px] ${isDarkMode ? 'bg-white/40' : 'bg-black/35'}`} />
      <div
        className={`w-2.5 z-10 transition-all duration-75 border ${isDarkMode ? 'bg-white border-white' : 'bg-black border-black'}`}
        style={{ height: `${candleHeight}px` }}
      />
    </div>
  );
}
