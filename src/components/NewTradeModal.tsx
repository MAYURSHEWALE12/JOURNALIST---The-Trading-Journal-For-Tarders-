import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LogoIcon from './LogoIcon';
import { STRATEGIES, EMOTIONAL_STATES } from '../types';
import type { NewTradeData } from '../types';

export default function NewTradeModal() {
  const [screenshotInput, setScreenshotInput] = useState('');
  const {
    isDarkMode, themeClasses, isNewTradeOpen, setIsNewTradeOpen,
    newTradeStep, setNewTradeStep, newTradeData, setNewTradeData, handleAddNewTrade,
  } = useApp();

  if (!isNewTradeOpen) return null;

  const update = (field: keyof NewTradeData, value: string | string[]) => {
    setNewTradeData((prev) => ({ ...prev, [field]: value }));
  };
  const toggleEmotion = (em: string) => {
    setNewTradeData((prev) => ({
      ...prev,
      emotions: prev.emotions.includes(em) ? prev.emotions.filter((x: string) => x !== em) : [...prev.emotions, em],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`border w-full max-w-lg rounded shadow-2xl overflow-hidden font-sans ${themeClasses.bgPanel} ${themeClasses.borderActive}`}>
        <div className={`p-4 border-b flex justify-between items-center ${themeClasses.border}`}>
          <div className="flex items-center space-x-2">
            <LogoIcon className="w-4.5 h-4.5" isDark={isDarkMode} />
            <span className={`text-sm font-semibold ${themeClasses.textMain}`}>Log Trading Journal Session</span>
          </div>
          <button onClick={() => setIsNewTradeOpen(false)} className="text-gray-400 hover:text-white text-xs font-semibold cursor-pointer">Close</button>
        </div>
        <div className={`px-6 py-3 border-b flex justify-between items-center text-[10px] font-mono text-gray-500 ${themeClasses.border} ${themeClasses.bgCard}`}>
          <span className={newTradeStep === 1 ? 'text-white font-bold' : ''}>1. Metrics</span>
          <span className={newTradeStep === 2 ? 'text-white font-bold' : ''}>2. Strategy & Tags</span>
          <span className={newTradeStep === 3 ? 'text-white font-bold' : ''}>3. Psychology</span>
        </div>
        <form onSubmit={handleAddNewTrade} className="p-6 space-y-4">
          {newTradeStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Asset Pair *</label>
                  <input type="text" placeholder="e.g. BTCUSD" required value={newTradeData.asset}
                    onChange={(e) => update('asset', e.target.value)}
                    className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Direction *</label>
                  <select value={newTradeData.direction} onChange={(e) => update('direction', e.target.value)}
                    className={`w-full border rounded px-3 py-2 text-xs focus:outline-none cursor-pointer focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Entry Price *</label>
                  <input type="number" step="any" placeholder="0.00" required value={newTradeData.entryPrice}
                    onChange={(e) => update('entryPrice', e.target.value)}
                    className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Exit Price</label>
                  <input type="number" step="any" placeholder="0.00" value={newTradeData.exitPrice}
                    onChange={(e) => update('exitPrice', e.target.value)}
                    className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Quantity *</label>
                  <input type="number" step="any" placeholder="0.00" required value={newTradeData.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                    className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Outcome</label>
                <select value={newTradeData.status} onChange={(e) => update('status', e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-xs focus:outline-none cursor-pointer focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                  <option value="WIN">WIN</option>
                  <option value="LOSS">LOSS</option>
                  <option value="BREAKEVEN">BREAKEVEN</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Custom P/L Profit ($)</label>
                <input type="number" placeholder="e.g. 500" value={newTradeData.netPnl}
                  onChange={(e) => update('netPnl', e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
              </div>
              <div className="flex justify-end pt-3">
                <button type="button" onClick={() => setNewTradeStep(2)}
                  className={`px-4 py-2 rounded text-xs font-semibold cursor-pointer ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                  Next: Strategy & Tags
                </button>
              </div>
            </div>
          )}
          {newTradeStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Strategy Used</label>
                <select value={newTradeData.strategy} onChange={(e) => update('strategy', e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-xs focus:outline-none cursor-pointer focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}>
                  {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Pills/Tags (comma separated)</label>
                <input type="text" placeholder="e.g. Scalp, FOMC, High-Volume" value={newTradeData.tagsString}
                  onChange={(e) => update('tagsString', e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Planned R-Multiple</label>
                  <input type="number" step="any" placeholder="e.g. 2" value={newTradeData.plannedR}
                    onChange={(e) => update('plannedR', e.target.value)}
                    className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Realized R-Multiple</label>
                  <input type="number" step="any" placeholder="e.g. 2" value={newTradeData.realizedR}
                    onChange={(e) => update('realizedR', e.target.value)}
                    className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
                </div>
              </div>
              <div className="flex justify-between pt-3">
                <button type="button" onClick={() => setNewTradeStep(1)}
                  className={`px-4 py-2 border rounded text-xs font-semibold cursor-pointer ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.bgHover} ${themeClasses.textMain}`}>Back</button>
                <button type="button" onClick={() => setNewTradeStep(3)}
                  className={`px-4 py-2 rounded text-xs font-semibold cursor-pointer ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>Next: Psychology & Log</button>
              </div>
            </div>
          )}
          {newTradeStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">Select Mindset during trade</label>
                <div className="grid grid-cols-3 gap-2">
                  {EMOTIONAL_STATES.map((em) => {
                    const isSelected = newTradeData.emotions.includes(em);
                    return (
                      <button type="button" key={em} onClick={() => toggleEmotion(em)}
                        className={`py-1.5 border rounded text-[10px] font-mono tracking-tight font-semibold cursor-pointer transition ${isSelected ? 'bg-white text-black border-white' : `bg-bg-hover text-gray-400 hover:text-white ${themeClasses.border}`}`}>
                        🎭 {em}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Qualitative Review Notes</label>
                <textarea rows={2} placeholder="Write your reflections..." value={newTradeData.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-xs focus:outline-none resize-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Chart Screenshots</label>
                <div className="flex gap-2 mb-2">
                  <input type="url" placeholder="e.g. https://tradingview.com/x/..." value={screenshotInput}
                    onChange={(e) => setScreenshotInput(e.target.value)}
                    className={`flex-1 border rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-400 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`} />
                  <button type="button"
                    onClick={() => {
                      if (!screenshotInput.trim()) return;
                      update('screenshotUrls', [...(newTradeData.screenshotUrls || []), screenshotInput.trim()]);
                      setScreenshotInput('');
                    }}
                    className={`px-3 py-2 border rounded text-xs transition cursor-pointer font-bold ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                    ＋ Add
                  </button>
                </div>
                {newTradeData.screenshotUrls && newTradeData.screenshotUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 border rounded bg-neutral-950/20 border-neutral-800">
                    {newTradeData.screenshotUrls.map((url: string, i: number) => (
                      <div key={i} className="relative w-16 h-12 border border-neutral-850 group overflow-hidden">
                        <img src={url} alt={`Preview ${i+1}`} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition" />
                        <button type="button"
                          onClick={() => {
                            update('screenshotUrls', newTradeData.screenshotUrls.filter((_: string, idx: number) => idx !== i));
                          }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 cursor-pointer transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-3">
                <button type="button" onClick={() => setNewTradeStep(2)}
                  className={`px-4 py-2 border rounded text-xs font-semibold cursor-pointer ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.bgHover} ${themeClasses.textMain}`}>Back</button>
                <button type="submit"
                  className={`px-4 py-2 rounded text-xs font-bold cursor-pointer hover:bg-opacity-90 flex items-center gap-1 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  <Check className="w-4 h-4" /> Save Trade Record
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
