import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NewAccountModal() {
  const {
    isDarkMode, themeClasses, isAddAccountOpen, setIsAddAccountOpen,
    newAccountData, setNewAccountData, handleAddNewAccount,
  } = useApp();

  if (!isAddAccountOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`border w-full max-w-sm rounded shadow-2xl overflow-hidden font-sans ${themeClasses.bgPanel} ${themeClasses.borderActive}`}>
        <div className={`p-4 border-b flex justify-between items-center ${themeClasses.border}`}>
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${themeClasses.textMain}`}>＋ Add Trading Account</span>
          <button onClick={() => setIsAddAccountOpen(false)} className="text-gray-400 hover:text-white text-xs font-semibold cursor-pointer">Close</button>
        </div>
        <form onSubmit={handleAddNewAccount} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">Account Name *</label>
            <input type="text" placeholder="e.g. Futures Challenge $100k" required
              value={newAccountData.name}
              onChange={(e) => setNewAccountData((prev) => ({ ...prev, name: e.target.value }))}
              className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">Market/Account Type</label>
            <select value={newAccountData.type}
              onChange={(e) => setNewAccountData((prev) => ({ ...prev, type: e.target.value }))}
              className={`w-full border rounded px-3 py-2 text-xs focus:outline-none cursor-pointer focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
            >
              <option value="Crypto">Crypto</option>
              <option value="Futures">Futures</option>
              <option value="Forex">Forex</option>
              <option value="Equities">Equities</option>
              <option value="Indices">Indices</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">Account Size / Starting Balance ($)</label>
            <input type="number" placeholder="e.g. 50000"
              value={newAccountData.accountSize}
              onChange={(e) => setNewAccountData((prev) => ({ ...prev, accountSize: e.target.value }))}
              className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
            />
          </div>
          <div className="flex justify-end pt-3">
            <button type="submit"
              className={`px-4 py-2 rounded text-xs font-bold cursor-pointer hover:bg-opacity-90 flex items-center gap-1 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
            >
              <Check className="w-4 h-4" /> Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
