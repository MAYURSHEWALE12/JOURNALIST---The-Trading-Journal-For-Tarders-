import { useEffect, useState } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase';
import LogoIcon from '../components/LogoIcon';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [supabaseRecovery, setSupabaseRecovery] = useState(false);

  const {
    themeClasses, isDarkMode,
    resetPassword, setResetPassword,
    resetLoading, resetError, setResetError,
    handleResetPassword,
  } = useApp();

  const isSupabase = isSupabaseConfigured();

  // Detect Supabase recovery context
  useEffect(() => {
    if (!isSupabase) return;
    
    const hash = window.location.hash;
    const search = window.location.search;
    
    const isRecovery = 
      hash.includes('type=recovery') || 
      hash.includes('access_token') || 
      search.includes('code=') || 
      search.includes('type=recovery');

    if (isRecovery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupabaseRecovery(true);
      setResetError('');
      // Verify session exists
      getSupabase().auth.getSession().then(({ data }) => {
        if (!data.session) {
          // If a code is in the URL, wait a moment for the supabase client to exchange it
          setTimeout(() => {
            getSupabase().auth.getSession().then(({ data: secondData }) => {
              if (!secondData.session) {
                setResetError('Invalid or expired reset link. Please request a new one.');
              }
            });
          }, 1000);
        }
      });
    } else {
      // Fallback: check if we already have an active session (redirect already processed)
      getSupabase().auth.getSession().then(({ data }) => {
        if (data.session) {
          setSupabaseRecovery(true);
          setResetError('');
        } else {
          setResetError('Invalid or missing reset link. Please request a new password reset.');
        }
      });
    }
  }, [isSupabase, setResetError]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSupabase && supabaseRecovery) {
      // For Supabase, token/email params are unused – session is already set from hash
      // handleResetPassword reads resetPassword from state internally
      handleResetPassword('', '');
      return;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center select-none px-6 ${themeClasses.bgBase}`}>
      <div className={`absolute top-4 left-6 flex items-center space-x-3 cursor-pointer`} onClick={() => navigate('/')}>
        <div className={`w-7 h-7 rounded flex items-center justify-center ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
          <LogoIcon className="w-4 h-4" isDark={isDarkMode} />
        </div>
        <span className={`font-display font-bold text-base tracking-tight ${themeClasses.textMain}`}>Journalist</span>
      </div>

      <div className={`w-full max-w-sm border rounded-xl p-8 space-y-6 shadow-xl ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className={`font-display font-bold text-xl ${themeClasses.textMain}`}>Choose New Password</h2>
          <p className={`text-xs ${themeClasses.textSub}`}>Enter a new password for your account</p>
        </div>

        {resetError && (
          <div className={`px-4 py-3 rounded border text-xs font-mono ${isDarkMode ? 'bg-red-950/50 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
            ⚠ {resetError}
          </div>
        )}

        {supabaseRecovery || (!isSupabase) ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">New Password <span className="text-gray-600">(min. 6 chars)</span></label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className={`w-full border rounded px-3 py-2.5 text-xs focus:outline-none focus:border-gray-400 transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
              />
            </div>
            <button
              type="submit"
              disabled={resetLoading}
              className={`w-full py-3 rounded text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer ${resetLoading ? 'opacity-60 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              {resetLoading ? (
                <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Resetting...</>
              ) : (
                <>Reset Password</>
              )}
            </button>
          </form>
        ) : (
          <div className={`px-4 py-4 rounded border text-xs font-mono leading-relaxed ${isDarkMode ? 'bg-amber-950/40 border-amber-800/40 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            Invalid or missing reset link. Please request a new password reset.
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/auth')}
            className={`inline-flex items-center gap-1.5 text-xs cursor-pointer transition ${themeClasses.textSub} hover:underline`}
          >
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
