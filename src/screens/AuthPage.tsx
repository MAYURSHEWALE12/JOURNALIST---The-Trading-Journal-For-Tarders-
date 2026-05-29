import { ShieldCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authSignInWithGoogle } from '../lib/api';
import LogoIcon from '../components/LogoIcon';
import Seo from '../components/Seo';

export default function AuthPage() {
  const navigate = useNavigate();
  const {
    themeClasses, isDarkMode,
    isSignUpMode, setIsSignUpMode,
    authEmail, setAuthEmail,
    authPassword, setAuthPassword,
    authUsername, setAuthUsername,
    authError, setAuthError, handleAuthSubmit, authLoading,
  } = useApp();

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center select-none px-6 ${themeClasses.bgBase}`}>
      <Seo 
        title="Sign In / Register | Secure Google Auth" 
        description="Access your secure personal cloud trading ledger. Supports cross-device sync and Google one-click OAuth."
        path="/auth" 
      />
      <div className={`absolute top-4 left-6 flex items-center space-x-3 cursor-pointer`} onClick={() => navigate('/')}>
        <div className={`w-7 h-7 rounded flex items-center justify-center ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
          <LogoIcon className="w-4 h-4" isDark={isDarkMode} />
        </div>
        <span className={`font-display font-bold text-base tracking-tight ${themeClasses.textMain}`}>Journalist</span>
      </div>

      {/* Auth Panel Box */}
      <div className={`w-full max-w-sm border rounded-xl p-8 space-y-6 shadow-xl ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className={`font-display font-bold text-xl ${themeClasses.textMain}`}>{isSignUpMode ? 'Create Your Account' : 'Welcome Back'}</h2>
          <p className={`text-xs ${themeClasses.textSub}`}>{isSignUpMode ? 'Start your trading journal today' : 'Sign in to your personal workspace'}</p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className={`px-4 py-3 rounded border text-xs font-mono ${
            authError.startsWith('✅')
              ? (isDarkMode ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
              : (isDarkMode ? 'bg-red-950/50 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700')
          }`}>
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Username — only shown on register */}
          {isSignUpMode && (
            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. traderpro"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                className={`w-full border rounded px-3 py-2.5 text-xs focus:outline-none focus:border-gray-400 transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. trader@journalist.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className={`w-full border rounded px-3 py-2.5 text-xs focus:outline-none focus:border-gray-400 transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">Password {isSignUpMode && <span className="text-gray-600">(min. 6 chars)</span>}</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className={`w-full border rounded px-3 py-2.5 text-xs focus:outline-none focus:border-gray-400 transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className={`w-full py-3 rounded text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer ${authLoading ? 'opacity-60 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
          >
            {authLoading ? (
              <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> {isSignUpMode ? 'Creating Account...' : 'Signing In...'}</>
            ) : (
              <>{isSignUpMode ? '✦ Create Account' : '→ Enter Workspace'}</>
            )}
          </button>

          {!isSignUpMode && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className={`inline-flex items-center gap-1.5 text-[11px] cursor-pointer transition ${themeClasses.textSub} hover:underline mt-1`}
              >
                <Lock className="w-3 h-3" /> Forgot Password?
              </button>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          <span className={`text-[10px] font-mono uppercase tracking-wider ${themeClasses.textSub}`}>or</span>
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
        </div>

        {/* Google Sign In */}
        <button
          onClick={() => authSignInWithGoogle()}
          className={`w-full py-2.5 border rounded text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} ${themeClasses.bgHover}`}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isSignUpMode ? 'Sign up with Google' : 'Sign in with Google'}
        </button>

        {/* Toggle mode */}
        <div className="text-center space-y-3 pt-1">
          <div className={`w-full h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          <button
            onClick={() => { setIsSignUpMode(!isSignUpMode); setAuthError(''); }}
            className={`text-xs cursor-pointer transition ${themeClasses.textSub} hover:underline`}
          >
            {isSignUpMode ? 'Already have an account? Sign In →' : 'New to Journalist? Create a Free Account →'}
          </button>
        </div>
      </div>
    </div>
  );
}
