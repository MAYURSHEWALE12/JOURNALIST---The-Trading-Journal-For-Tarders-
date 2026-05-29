import { useApp } from '../context/AppContext';

export default function DeleteConfirmModal() {
  const { isDarkMode, themeClasses, deleteConfirmId, setDeleteConfirmId, handleDeleteTrade } = useApp();

  if (!deleteConfirmId) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`border rounded shadow-2xl w-full max-w-md p-8 ${isDarkMode ? 'bg-[#111] border-rose-900/50' : 'bg-white border-rose-300'}`}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full border border-rose-500/30 bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗑️</span>
          </div>
          <h3 className={`font-display text-lg font-bold mb-2 ${themeClasses.textMain}`}>Delete Trade Log</h3>
          <p className={`font-sans text-sm ${themeClasses.textSub}`}>This action is permanent and cannot be undone. The trade record will be permanently removed from your journal.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className={`flex-1 py-2.5 border rounded text-xs font-mono uppercase tracking-widest transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} hover:border-gray-400`}
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteTrade(deleteConfirmId)}
            className="flex-1 py-2.5 border border-rose-700 bg-rose-900/30 rounded text-xs font-mono uppercase tracking-widest text-rose-400 hover:bg-rose-900/50 hover:border-rose-500 transition cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
