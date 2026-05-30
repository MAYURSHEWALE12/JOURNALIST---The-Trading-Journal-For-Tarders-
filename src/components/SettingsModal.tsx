import React, { useState, useRef, useEffect } from 'react';
import { X, User, Image, KeyRound, Link, ShieldAlert, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authLinkGoogle, authSetPassword } from '../lib/api';

type TabType = 'profile' | 'identity' | 'security';

export default function SettingsModal() {
  const {
    isSettingsOpen, setIsSettingsOpen,
    user, updateUserProfile,
    isDarkMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile Form States
  const [username, setUsername] = useState('');
  const [tradingBio, setTradingBio] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  
  // Security States
  const [newPassword, setNewPassword] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: 'success' });
  const [isSyncing, setIsSyncing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync inputs with user state on open/change
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsername(user.username || '');
      setTradingBio(user.tradingBio || '');
      setTwitterHandle(user.twitterHandle || '');
      setTelegramHandle(user.telegramHandle || '');
    }
  }, [user, isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: 'success' }), 4000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      await updateUserProfile({
        username: username.trim(),
        tradingBio: tradingBio.trim(),
        twitterHandle: twitterHandle.trim(),
        telegramHandle: telegramHandle.trim(),
      });
      showFeedback('Profile updated successfully!');
    } catch (err) {
      showFeedback((err as Error).message || 'Failed to update profile.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Hidden canvas image compressor
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85); // High quality compression
          
          updateUserProfile({ avatarUrl: compressedBase64 })
            .then(() => showFeedback('Profile picture updated!'))
            .catch(() => showFeedback('Failed to save profile picture.', 'error'));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateUserProfile({ avatarUrl: '' });
      showFeedback('Profile picture removed.');
    } catch {
      showFeedback('Failed to remove photo.', 'error');
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showFeedback('Password must be at least 6 characters long.', 'error');
      return;
    }
    setIsSyncing(true);
    try {
      await authSetPassword(newPassword);
      setNewPassword('');
      showFeedback('Password configured! You can now sign in with email + password.');
    } catch (err) {
      showFeedback((err as Error).message || 'Failed to update credentials.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLinkGoogleClick = async () => {
    try {
      await authLinkGoogle();
    } catch (err) {
      showFeedback((err as Error).message || 'Failed to link Google account.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="w-full max-w-xl rounded-2xl border flex flex-col md:flex-row overflow-hidden shadow-2xl relative transition-all duration-300"
        style={{
          backgroundColor: isDarkMode ? '#0b0b0c' : '#ffffff',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
          minHeight: '420px',
        }}
      >
        {/* Left Side Tab Navigation */}
        <div 
          className="w-full md:w-48 border-b md:border-b-0 md:border-r p-4 flex md:flex-col gap-1.5 shrink-0"
          style={{
            borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
            backgroundColor: isDarkMode ? '#070708' : '#fafafa',
          }}
        >
          <div className="hidden md:flex items-center gap-2 mb-6 px-2">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">Settings</span>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-tight transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profile Metadata
          </button>
          
          <button
            onClick={() => setActiveTab('identity')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-tight transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'identity'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Image className="w-3.5 h-3.5" /> Profile Photo
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-tight transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Security & Auth
          </button>
        </div>

        {/* Right Side Content Panel */}
        <div className="flex-1 flex flex-col justify-between p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}>
            <div>
              <h3 className="text-sm font-bold font-mono text-white" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                {activeTab === 'profile' ? 'Profile Settings' : activeTab === 'identity' ? 'Trading Identity' : 'Credentials & Integrations'}
              </h3>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                {activeTab === 'profile' 
                  ? 'Manage your public name, trading specialization, and social handles.' 
                  : activeTab === 'identity' 
                    ? 'Upload your brand image. This photo will represent you on shareable performance cards.'
                    : 'Manage account authentication linkages and set security credentials.'}
              </p>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="text-gray-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/[0.04] shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form / Dynamic Section */}
          <div className="flex-1 py-5 overflow-y-auto min-h-[220px]">
            {feedbackMsg.text && (
              <div 
                className={`mb-4 px-3 py-2 rounded-lg border text-[10px] font-mono flex items-center gap-2 ${
                  feedbackMsg.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}
              >
                {feedbackMsg.type === 'error' ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {feedbackMsg.text}
              </div>
            )}

            {/* TAB: PROFILE METADATA */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1.5">Username / Alias</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border rounded-lg focus:outline-none focus:border-indigo-500/60 text-white"
                    style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)' }}
                    placeholder="Enter your name or trade brand..."
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1.5">Trading Motto / Specialty</label>
                  <input
                    type="text"
                    value={tradingBio}
                    onChange={(e) => setTradingBio(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border rounded-lg focus:outline-none focus:border-indigo-500/60 text-white"
                    style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)' }}
                    placeholder="e.g. SMC Scalper, Systematic Swing, Price Action..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1.5">𝕏 (Twitter) Handle</label>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border rounded-lg focus:outline-none focus:border-indigo-500/60 text-white"
                      style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)' }}
                      placeholder="@yourhandle"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1.5">✈️ Telegram Username</label>
                    <input
                      type="text"
                      value={telegramHandle}
                      onChange={(e) => setTelegramHandle(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border rounded-lg focus:outline-none focus:border-indigo-500/60 text-white"
                      style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)' }}
                      placeholder="username"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-2.5 mt-2 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSyncing ? 'SAVING...' : 'SAVE PROFILE CHANGES'}
                </button>
              </form>
            )}

            {/* TAB: IDENTITY PHOTO */}
            {activeTab === 'identity' && (
              <div className="flex flex-col items-center gap-6 font-mono">
                {/* File input (hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Circular Avatar Preview with premium glowing borders */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full blur-xs opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
                  <div 
                    className="w-24 h-24 rounded-full border-2 overflow-hidden flex items-center justify-center relative z-10"
                    style={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      backgroundColor: isDarkMode ? '#141416' : '#f0f0f2',
                    }}
                  >
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Profile avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-500" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-xs text-xs">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 rounded-lg bg-white text-black hover:bg-gray-200 font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    SELECT PROFILE PHOTO
                  </button>

                  {user?.avatarUrl && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="w-full py-2 rounded-lg border border-rose-800/40 bg-rose-900/10 text-rose-400 hover:bg-rose-950/20 font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      REMOVE CURRENT PHOTO
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-gray-500 text-center max-w-sm font-mono mt-1">
                  Supported formats: JPG, PNG. Image will automatically compress to an optimized 200x200 canvas crop to preserve ultra-fast performance card download speeds.
                </div>
              </div>
            )}

            {/* TAB: SECURITY & AUTH */}
            {activeTab === 'security' && (
              <div className="space-y-6 font-mono text-xs">
                {/* Credentials Set password */}
                <form onSubmit={handleSetPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Set Password credential</label>
                    <p className="text-[9px] text-gray-500 mb-2 leading-tight">If you originally logged in via OAuth, you can define a password to log in directly with your email too.</p>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border rounded-lg focus:outline-none focus:border-indigo-500/60 text-white"
                      style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)' }}
                      placeholder="Define minimum 6 characters..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="w-full py-2.5 rounded-lg border hover:border-white transition text-white font-bold cursor-pointer disabled:opacity-50"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    {isSyncing ? 'CONFIGURING...' : 'CONFIGURE EMAIL PASSWORD'}
                  </button>
                </form>

                {/* Third-party OAuth integration links */}
                <div className="border-t pt-4" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}>
                  <label className="block text-[9px] uppercase font-bold text-gray-500 mb-2">Social Auth Integrations</label>
                  <button
                    onClick={handleLinkGoogleClick}
                    className="w-full py-2.5 rounded-lg border hover:border-white transition flex items-center justify-center gap-2 cursor-pointer text-gray-300"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    <Link className="w-3.5 h-3.5" /> LINK GOOGLE IDENTITY
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer branding */}
          <div className="pt-4 border-t flex justify-between items-center text-[8px] font-mono text-gray-600 uppercase tracking-widest shrink-0" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}>
            <span>Journalist Trader Profile</span>
            <span>v1.0.0 &bull; Secure Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
