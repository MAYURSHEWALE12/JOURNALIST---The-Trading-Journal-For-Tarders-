import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EditTradeData } from '../types';

export default function EditTradeModal() {
  const [screenshotInput, setScreenshotInput] = useState('');
  const {
    isDarkMode, themeClasses, isEditTradeOpen, editTradeData,
    setEditTradeData, setIsEditTradeOpen, handleEditTradeSubmit,
    isEditingTrade,
  } = useApp();

  if (!isEditTradeOpen || !editTradeData) return null;

  const update = (field: keyof EditTradeData, value: string | string[]) => {
    setEditTradeData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`border rounded shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-[#111] border-border-active' : 'bg-white border-gray-300'}`}>
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 ${isDarkMode ? 'bg-[#111] border-border-subtle' : 'bg-white border-gray-200'}`}>
          <div>
            <span className={`text-xs font-mono uppercase tracking-widest ${themeClasses.textSub}`}>Editing Trade</span>
            <h3 className={`font-display text-xl font-bold ${themeClasses.textMain}`}>{editTradeData.asset}</h3>
          </div>
          <button onClick={() => { setIsEditTradeOpen(false); setEditTradeData(null); }} className="text-gray-400 hover:text-white cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleEditTradeSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Asset Pair</label>
              <input type="text" required value={editTradeData.asset} onChange={e => update('asset', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Trade Date</label>
              <input type="date" required value={editTradeData.tradeDate} onChange={e => update('tradeDate', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Strategy</label>
              <input type="text" value={editTradeData.strategy} onChange={e => update('strategy', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Direction</label>
              <select value={editTradeData.direction} onChange={e => update('direction', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Outcome</label>
              <select value={editTradeData.status} onChange={e => update('status', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                <option value="WIN">WIN</option>
                <option value="LOSS">LOSS</option>
                <option value="BREAKEVEN">BREAKEVEN</option>
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Quantity</label>
              <input type="number" value={editTradeData.quantity} onChange={e => update('quantity', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Entry Price</label>
              <input type="number" step="any" value={editTradeData.entryPrice} onChange={e => update('entryPrice', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Exit Price</label>
              <input type="number" step="any" value={editTradeData.exitPrice} onChange={e => update('exitPrice', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Net PnL ($)</label>
              <input type="number" step="any" value={editTradeData.netPnl} onChange={e => update('netPnl', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Planned R</label>
              <input type="number" step="any" value={editTradeData.plannedR} onChange={e => update('plannedR', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Realized R</label>
              <input type="number" step="any" value={editTradeData.realizedR} onChange={e => update('realizedR', e.target.value)}
                className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Tags (comma-separated)</label>
            <input type="text" value={editTradeData.tagsString} onChange={e => update('tagsString', e.target.value)}
              placeholder="e.g. fvg, ob, sweep"
              className={`w-full border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
          </div>
          <div>
            <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Chart Screenshots</label>
            <div className="flex gap-2 mb-2">
              <input type="url" placeholder="e.g. https://tradingview.com/x/..." value={screenshotInput}
                onChange={(e) => setScreenshotInput(e.target.value)}
                className={`flex-1 border rounded py-2 px-3 text-sm font-mono focus:outline-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
              <button type="button"
                onClick={() => {
                  if (!screenshotInput.trim()) return;
                  update('screenshotUrls', [...(editTradeData.screenshotUrls || []), screenshotInput.trim()]);
                  setScreenshotInput('');
                }}
                className={`px-4 py-2 border rounded text-xs transition cursor-pointer font-bold ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                ＋ Add
              </button>
            </div>
            {editTradeData.screenshotUrls && editTradeData.screenshotUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border rounded bg-neutral-950/20 border-neutral-800">
                {editTradeData.screenshotUrls.map((url: string, i: number) => (
                  <div key={i} className="relative w-16 h-12 border border-neutral-850 group overflow-hidden">
                    <img src={url} alt={`Preview ${i+1}`} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition" />
                    <button type="button"
                      onClick={() => {
                        update('screenshotUrls', editTradeData.screenshotUrls.filter((_: string, idx: number) => idx !== i));
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 cursor-pointer transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 ${themeClasses.textSub}`}>Journal Notes</label>
            <textarea rows={5} value={editTradeData.notes} onChange={e => update('notes', e.target.value)}
              className={`w-full border rounded py-2 px-3 text-sm font-sans focus:outline-none resize-none transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} focus:border-gray-400`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setIsEditTradeOpen(false); setEditTradeData(null); }}
              className={`flex-1 py-2.5 border rounded text-xs font-mono uppercase tracking-widest cursor-pointer transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textSub} hover:border-gray-400`}>Cancel</button>
            <button type="submit" disabled={isEditingTrade}
              className={`flex-1 py-2.5 border rounded text-xs font-mono uppercase tracking-widest cursor-pointer font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${isDarkMode ? 'bg-white text-black border-white hover:bg-gray-100' : 'bg-black text-white border-black hover:bg-gray-900'}`}>
              {isEditingTrade ? (
                <><span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
