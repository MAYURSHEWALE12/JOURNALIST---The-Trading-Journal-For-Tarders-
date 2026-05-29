import { ShieldCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LogoIcon from '../components/LogoIcon';

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
