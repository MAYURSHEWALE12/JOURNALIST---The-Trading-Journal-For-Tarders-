import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ScreenshotModal() {
  const { selectedScreenshot, setSelectedScreenshot } = useApp();

  if (!selectedScreenshot) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out p-4 md:p-8"
      onClick={() => setSelectedScreenshot(null)}
    >
      <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-200">
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedScreenshot(null); }}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded hover:bg-white/20 transition-all border border-white/20 z-50"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={selectedScreenshot}
          alt="Fullscreen screenshot view"
          className="max-w-full max-h-full object-contain rounded shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
