import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';
import LogoIcon from '../components/LogoIcon';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // 6 separate boxes for OTP (only used when Supabase NOT configured)
  const [otpArray, setOtpArray] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    themeClasses, isDarkMode,
    forgotEmail, setForgotEmail,
    forgotLoading, forgotError, setForgotError,
    forgotSent, setForgotSent, forgotResetUrl,
    handleForgotPassword,
    resetPassword, setResetPassword,
    resetLoading, resetError, setResetError,
    handleResetPassword,
  } = useApp();

  const isSupabase = isSupabaseConfigured();

  // Reset errors and fields on mount or status change
  useEffect(() => {
    setForgotError('');
    setResetError('');
  }, [forgotSent, setForgotError, setResetError]);

  // Handle key inputs in 6-digit OTP fields
  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) return;

    const newOtpArray = [...otpArray];
    // If user enters multiple digits (like a paste or fast typing), split it
    const digits = cleanVal.split('');
    let targetIndex = index;

    for (let i = 0; i < digits.length && targetIndex < 6; i++) {
      newOtpArray[targetIndex] = digits[i];
      targetIndex++;
    }

    setOtpArray(newOtpArray);

    // Auto-focus next box
    const nextIndex = Math.min(targetIndex, 5);
    if (nextIndex !== index) {
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtpArray = [...otpArray];
      
      // If current is empty, clear previous and focus it
      if (!otpArray[index] && index > 0) {
        newOtpArray[index - 1] = '';
        setOtpArray(newOtpArray);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtpArray[index] = '';
        setOtpArray(newOtpArray);
      }
    }
  };

  // Support paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtpArray = [...otpArray];
      for (let i = 0; i < pastedData.length; i++) {
        newOtpArray[i] = pastedData[i];
      }
      setOtpArray(newOtpArray);
      // Focus last filled box or last box
      const focusTarget = Math.min(pastedData.length, 5);
      inputRefs.current[focusTarget]?.focus();
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpArray.join('');
    if (fullOtp.length !== 6) {
      setResetError('Please enter all 6 digits of the code.');
      return;
    }
    handleResetPassword(fullOtp, forgotEmail);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center select-none px-6 ${themeClasses.bgBase}`}>
      {/* Brand Header — Exact Match with AuthPage */}
      <div className={`absolute top-4 left-6 flex items-center space-x-3 cursor-pointer`} onClick={() => navigate('/')}>
        <div className={`w-7 h-7 rounded flex items-center justify-center ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
          <LogoIcon className="w-4 h-4" isDark={isDarkMode} />
        </div>
        <span className={`font-display font-bold text-base tracking-tight ${themeClasses.textMain}`}>Journalist</span>
      </div>

      {/* Panel Box — Exact Match with AuthPage */}
      <div className={`w-full max-w-sm border rounded-xl p-8 space-y-6 shadow-xl ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
            {forgotSent ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h2 className={`font-display font-bold text-xl ${themeClasses.textMain}`}>
            {forgotSent ? 'Verify Code' : 'Reset Password'}
          </h2>
          <p className={`text-xs ${themeClasses.textSub}`}>
            {forgotSent ? 'A 6-digit OTP code has been sent to your email.' : 'Enter your email address to receive a secure OTP code.'}
          </p>
        </div>

        {(forgotError || resetError) && (
          <div className={`px-4 py-3 rounded border text-xs font-mono ${isDarkMode ? 'bg-red-950/50 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
            ⚠ {forgotError || resetError}
          </div>
        )}

        {forgotSent ? (
          isSupabase ? (
            <div className={`px-4 py-4 rounded border text-xs font-mono leading-relaxed ${isDarkMode ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              ✅ A password reset link has been sent to <strong>{forgotEmail}</strong>. Check your inbox (and spam folder) and follow the link to reset your password.
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              
              {/* Dev Mode Autofill Helper */}
              {forgotResetUrl && (
                <div 
                  onClick={() => {
                    const digits = forgotResetUrl.split('');
                    if (digits.length === 6) {
                      setOtpArray(digits);
                    }
                  }}
                  className={`px-4 py-3 rounded border text-xs font-mono break-all leading-relaxed cursor-pointer transition-all ${isDarkMode ? 'bg-gray-900 border-emerald-800/40 text-emerald-400' : 'bg-gray-50 border-emerald-200 text-emerald-700'}`}
                >
                  💡 <strong className={themeClasses.textMain}>Dev OTP:</strong> <span className="font-bold underline tracking-widest text-emerald-400">{forgotResetUrl}</span> <span className="text-[10px] opacity-60">(Click to autofill)</span>
                </div>
              )}

              {/* Premium 6-Digit OTP Boxes */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-gray-500 text-center">Enter Verification Code</label>
                <div className="flex justify-between gap-1.5 max-w-sm mx-auto">
                  {otpArray.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-full max-w-[40px] aspect-[4/5] sm:max-w-[44px] sm:h-12 border rounded-lg text-center font-mono font-bold text-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-all ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
                    />
                  ))}
                </div>
              </div>

              {/* New Password input */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">New Password <span className="text-gray-600">(min. 6 chars)</span></label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className={`w-full border rounded px-3 py-2.5 text-xs focus:outline-none focus:border-gray-400 transition-all ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
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

              <button
                type="button"
                onClick={() => { setForgotSent(false); setOtpArray(['', '', '', '', '', '']); }}
                className={`w-full py-3 border rounded text-xs font-medium transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain} ${themeClasses.bgHover}`}
              >
                Resend Code
              </button>
            </form>
          )
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="trader@journalist.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className={`w-full border rounded px-3 py-2.5 text-xs focus:outline-none focus:border-gray-400 transition-all ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.textMain}`}
              />
            </div>
            <button
              type="submit"
              disabled={forgotLoading}
              className={`w-full py-3 rounded text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer ${forgotLoading ? 'opacity-60 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              {forgotLoading ? (
                <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Sending...</>
              ) : (
                <>Send Verification Code</>
              )}
            </button>
          </form>
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
