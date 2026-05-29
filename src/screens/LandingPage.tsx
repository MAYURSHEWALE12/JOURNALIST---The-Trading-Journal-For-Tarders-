import { useEffect } from 'react';
import {
  Check, Sliders, ShieldCheck, Zap, ArrowRight, CircleDot,
  Heart, Sun, Moon
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LogoIcon from '../components/LogoIcon';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.fade-in-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const {
    isDarkMode, setIsDarkMode, themeClasses,
    user, tickerPrices,
    faqOpen, setFaqOpen,
    landingMobileMenuOpen, setLandingMobileMenuOpen,
    setUser,
  } = useApp();

  const liveChartData = [
    { trade: 1, balance: 10000 },
    { trade: 2, balance: 10250 },
    { trade: 3, balance: 10120 },
    { trade: 4, balance: 10580 },
    { trade: 5, balance: 10400 },
    { trade: 6, balance: 11200 },
    { trade: 7, balance: 10980 },
    { trade: 8, balance: 11450 },
    { trade: 9, balance: 11900 },
    { trade: 10, balance: 12500 }
  ];

  const toggleFaq = (idx: number) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const faqQuestions = [
    { q: "Is my trade history stored securely?", a: "Yes. Journalist encrypts trade history locally and pairs password hashes using modern security protocols before cloud synchronization." },
    { q: "Can I connect custom trading accounts?", a: "Absolutely. You can track multiple accounts across crypto, futures, and traditional forex concurrently." },
    { q: "How does the keyboard shortcut cmd+k work?", a: "Pressing CMD+K or CTRL+K opens the global search and command panel instantly to log trades or jump between tabs." },
    { q: "Does the app support imports from MT4/MT5?", a: "Yes, you can import spreadsheet data and logs using standard formatting in the imports wizard." },
    { q: "Can I use the app completely free?", a: "Yes. Our standard sandbox mode and core logging metrics are completely free with no limits." }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between select-none relative overflow-hidden ${themeClasses.bgBase}`}>

      {/* Animated Background Dot Grid */}
      <div className={`absolute inset-0 pointer-events-none z-0 opacity-80 animate-pan ${isDarkMode ? 'dot-grid-dark' : 'dot-grid-light'}`} />

      {/* Ticker Tape */}
      <div className={`w-full border-b py-2 overflow-x-hidden text-xs font-mono z-20 relative ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="flex space-x-12 animate-[marquee_20s_infinite_linear] whitespace-nowrap px-4 justify-around">
          <span className={`flex items-center ${themeClasses.textSub}`}><CircleDot className={`w-3 h-3 mr-2 ${isDarkMode ? 'text-white' : 'text-black'}`} /> Live Market Tickers</span>
          <span>BTCUSD: <strong className={themeClasses.textMain}>${tickerPrices.BTC.toLocaleString()}</strong></span>
          <span>ETHUSD: <strong className={themeClasses.textMain}>${tickerPrices.ETH.toLocaleString()}</strong></span>
          <span>EURUSD: <strong className={themeClasses.textMain}>{tickerPrices.EURUSD.toFixed(5)}</strong></span>
          <span>AAPL: <strong className={themeClasses.textMain}>${tickerPrices.AAPL}</strong></span>
          <span>NVDA: <strong className={themeClasses.textMain}>${tickerPrices.NVDA}</strong></span>
        </div>
      </div>

      {/* Navigation bar - Sticky with Backdrop Blur */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 ${themeClasses.border} ${isDarkMode ? 'bg-[#050505]/75' : 'bg-white/75'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded flex items-center justify-center inner-stroke shadow-md ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
              <LogoIcon className="w-5 h-5" isDark={isDarkMode} />
            </div>
            <span className={`font-display font-bold text-xl tracking-tight ${themeClasses.textMain}`}>Journalist</span>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold border hidden sm:inline-block ${isDarkMode ? 'bg-[#222222] text-white border-white/20' : 'bg-gray-100 text-black border-black/10'}`}>SECURE STORAGE</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#features" className={`${themeClasses.textSub} hover:${themeClasses.textMain} transition`}>Features</a>
            <a href="#workflow" className={`${themeClasses.textSub} hover:${themeClasses.textMain} transition`}>Workflow</a>
            <a href="#comparison" className={`${themeClasses.textSub} hover:${themeClasses.textMain} transition`}>Comparison</a>
            <a href="#pricing" className={`${themeClasses.textSub} hover:${themeClasses.textMain} transition`}>Pricing</a>
            <a href="#faq" className={`${themeClasses.textSub} hover:${themeClasses.textMain} transition`}>FAQ</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-8 h-8 rounded border flex items-center justify-center transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.bgHover}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-black" />}
            </button>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className={`px-4 py-2 text-sm font-medium border rounded transition duration-200 cursor-pointer hidden sm:block ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.bgHover}`}
            >
              {user ? 'Enter Workspace' : 'Log In Account'}
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setLandingMobileMenuOpen(!landingMobileMenuOpen)}
              className={`w-8 h-8 rounded border flex md:hidden items-center justify-center transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.bgHover}`}
            >
              <div className="space-y-1.5">
                <span className={`block w-4 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-black'}`} />
                <span className={`block w-4 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-black'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {landingMobileMenuOpen && (
          <div className={`md:hidden absolute w-full border-b py-4 px-6 flex flex-col space-y-3 z-50 ${themeClasses.bgPanel} ${themeClasses.border}`}>
            <a href="#features" onClick={() => setLandingMobileMenuOpen(false)} className={`${themeClasses.textSub} py-1 text-sm font-medium`}>Features</a>
            <a href="#workflow" onClick={() => setLandingMobileMenuOpen(false)} className={`${themeClasses.textSub} py-1 text-sm font-medium`}>Workflow</a>
            <a href="#comparison" onClick={() => setLandingMobileMenuOpen(false)} className={`${themeClasses.textSub} py-1 text-sm font-medium`}>Comparison</a>
            <a href="#pricing" onClick={() => setLandingMobileMenuOpen(false)} className={`${themeClasses.textSub} py-1 text-sm font-medium`}>Pricing</a>
            <a href="#faq" onClick={() => setLandingMobileMenuOpen(false)} className={`${themeClasses.textSub} py-1 text-sm font-medium`}>FAQ</a>
            <button
              onClick={() => {
                setLandingMobileMenuOpen(false);
                navigate(user ? '/dashboard' : '/auth');
              }}
              className={`w-full py-2.5 mt-2 border rounded text-center text-sm font-medium ${themeClasses.bgCard} ${themeClasses.border}`}
            >
              {user ? 'Enter Workspace' : 'Log In Account'}
            </button>
          </div>
        )}
      </header>

      {/* Hero Section with Live Mini Chart Preview */}
      <main className="max-w-6xl w-full mx-auto px-6 flex-1 flex flex-col justify-center items-center text-center mt-16 md:mt-24 mb-16 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full text-left">
          <div className="lg:col-span-7 flex flex-col justify-center items-start">
            <h1 className={`font-display font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[1.08] max-w-xl ${themeClasses.textMain}`}>
              Every trade leaves a trace.<br />
              <span className={`border-b-2 ${isDarkMode ? 'border-white text-white' : 'border-black text-black'}`}>Journal it cleanly.</span>
            </h1>

            <p className={`${themeClasses.textSub} text-base md:text-lg max-w-xl mt-6 leading-relaxed`}>
              A premium full-stack Trading Journal workspace combining clean black/white typography, high-density charts, and macOS-inspired fluid keyboard-first operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className={`px-8 py-4 rounded font-medium tracking-tight shadow-lg transition duration-300 flex items-center justify-center gap-3 cursor-pointer group ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                {user ? 'Enter Dashboard' : 'Create Free Account'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setUser(null);
                  navigate('/dashboard');
                }}
                className={`px-8 py-4 border rounded font-medium tracking-tight transition duration-200 justify-center flex items-center cursor-pointer ${themeClasses.bgPanel} ${themeClasses.border} ${themeClasses.bgHover}`}
              >
                Explore Workspace Guest
              </button>
            </div>
          </div>

          {/* Interactive Live Mini Equity Chart in Hero */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center">
            <div className={`p-6 rounded border ${isDarkMode ? 'bg-[#0a0a0a]/90 border-white/10' : 'bg-white/90 border-gray-200'} shadow-xl backdrop-blur`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className={`text-xs font-mono uppercase tracking-wider ${themeClasses.textSub}`}>Live Simulator Balance</span>
                  <h4 className={`text-2xl font-bold font-mono tracking-tight ${themeClasses.textMain}`}>$12,500.00</h4>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-mono ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                  +25.0% Profit Curve
                </div>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liveChartData}>
                    <defs>
                      <linearGradient id="eqColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDarkMode ? '#ffffff' : '#000000'} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={isDarkMode ? '#ffffff' : '#000000'} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="trade" hide />
                    <YAxis domain={['dataMin - 500', 'dataMax + 500']} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
                        borderColor: isDarkMode ? '#222222' : '#e5e7eb',
                        color: isDarkMode ? '#ffffff' : '#000000',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke={isDarkMode ? '#ffffff' : '#000000'}
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#eqColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[10px] font-mono mt-2 tracking-wider uppercase border-t pt-3 border-dashed border-neutral-800">
                <span className={themeClasses.textSub}>Sample Account Acc-1</span>
                <span className={themeClasses.textSub}>Trades: 10 logged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Glassmorphism Dashboard Preview Mockup Section */}
        <div className="w-full max-w-5xl mt-24 fade-in-on-scroll">
          <h2 className={`text-2xl font-bold font-display tracking-tight text-center mb-8 ${themeClasses.textMain}`}>
            A premium, high-density terminal interface built for rapid tracking
          </h2>
          <div className={`rounded-xl border shadow-2xl overflow-hidden transition-all backdrop-blur-md ${isDarkMode ? 'bg-[#0c0c0c]/80 border-white/10' : 'bg-white/80 border-gray-300'}`}>
            {/* Browser control panel */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-inherit">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
              </div>
              <div className={`px-4 py-1 rounded text-xs font-mono w-64 text-center ${isDarkMode ? 'bg-[#181818] text-neutral-400' : 'bg-gray-100 text-neutral-600'}`}>
                journalist.app/dashboard
              </div>
              <div className="w-8" />
            </div>

            {/* Preview UI content */}
            <div className="p-6 text-left grid grid-cols-1 md:grid-cols-4 gap-4 select-none opacity-90">
              <div className={`p-4 rounded border ${isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-[10px] font-mono uppercase tracking-wider block text-neutral-400">Total Trades</span>
                <h5 className={`text-xl font-bold font-mono mt-1 ${themeClasses.textMain}`}>1,424</h5>
              </div>
              <div className={`p-4 rounded border ${isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-[10px] font-mono uppercase tracking-wider block text-neutral-400">Win Rate</span>
                <h5 className={`text-xl font-bold font-mono mt-1 ${themeClasses.textMain}`}>64.2%</h5>
              </div>
              <div className={`p-4 rounded border ${isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-[10px] font-mono uppercase tracking-wider block text-neutral-400">Profit Factor</span>
                <h5 className={`text-xl font-bold font-mono mt-1 ${themeClasses.textMain}`}>2.18</h5>
              </div>
              <div className={`p-4 rounded border ${isDarkMode ? 'bg-[#141414] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-[10px] font-mono uppercase tracking-wider block text-neutral-400">Total Net Profit</span>
                <h5 className={`text-xl font-bold font-mono mt-1 ${themeClasses.textMain}`}>+$42,150</h5>
              </div>

              <div className={`md:col-span-4 p-4 rounded border ${isDarkMode ? 'bg-[#141414]/60 border-white/5' : 'bg-gray-50/60 border-gray-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Recent Executions</span>
                  <span className="text-[10px] font-mono text-neutral-400">Updated just now</span>
                </div>
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-neutral-800">
                    <span>BTCUSD <strong className="text-green-500">LONG</strong></span>
                    <span>Entry: $96,250</span>
                    <span className="text-green-500 font-semibold">+$637.50</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-neutral-800">
                    <span>EURUSD <strong className="text-red-500">SHORT</strong></span>
                    <span>Entry: $1.0845</span>
                    <span className="text-red-500 font-semibold">-$270.00</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span>NVDA <strong className="text-green-500">LONG</strong></span>
                    <span>Entry: $1,142.10</span>
                    <span className="text-green-500 font-semibold">+$940.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24 text-left fade-in-on-scroll">

          <div className={`p-6 rounded flex flex-col justify-between h-48 transition duration-300 cursor-pointer border ${isDarkMode ? 'bg-[#0a0a0a] border-white/5 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-400 shadow-sm'}`}>
            <div className={`w-10 h-10 rounded flex items-center justify-center ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-display font-semibold text-lg ${themeClasses.textMain}`}>Dynamic Equity Metrics</h3>
              <p className={`text-sm mt-1 ${themeClasses.textSub}`}>Real-time calculations of Profit Factor, Win Rate, and absolute Drawdown curve indexes.</p>
            </div>
          </div>

          <div className={`p-6 rounded flex flex-col justify-between h-48 transition duration-300 cursor-pointer border ${isDarkMode ? 'bg-[#0a0a0a] border-white/5 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-400 shadow-sm'}`}>
            <div className={`w-10 h-10 rounded flex items-center justify-center ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-display font-semibold text-lg ${themeClasses.textMain}`}>Psychology Core Analysis</h3>
              <p className={`text-sm mt-1 ${themeClasses.textSub}`}>Discover correlations between emotional states like greed or FOMO and bottom line returns.</p>
            </div>
          </div>

          <div className={`p-6 rounded flex flex-col justify-between h-48 transition duration-300 cursor-pointer border ${isDarkMode ? 'bg-[#0a0a0a] border-white/5 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-400 shadow-sm'}`}>
            <div className={`w-10 h-10 rounded flex items-center justify-center ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-display font-semibold text-lg ${themeClasses.textMain}`}>Keyboard-First Operations</h3>
              <p className={`text-sm mt-1 ${themeClasses.textSub}`}>Activate the Command Palette with <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>CMD+K</kbd> to execute workflows instantly.</p>
            </div>
          </div>

        </div>

        {/* "How It Works" 3-Step Section */}
        <div id="workflow" className="w-full max-w-5xl mt-28 fade-in-on-scroll">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Modern Workflow</span>
            <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight mt-2 ${themeClasses.textMain}`}>
              Log and analyze in three simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 rounded border text-left flex flex-col justify-between ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
              <div>
                <span className={`text-3xl font-mono block mb-4 ${isDarkMode ? 'text-white/20' : 'text-black/10'}`}>01</span>
                <h4 className={`font-display font-semibold text-lg mb-2 ${themeClasses.textMain}`}>Register & Secure</h4>
                <p className={`text-sm ${themeClasses.textSub}`}>Create a free multi-user isolated account and secure your personal credentials instantly.</p>
              </div>
            </div>

            <div className={`p-6 rounded border text-left flex flex-col justify-between ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
              <div>
                <span className={`text-3xl font-mono block mb-4 ${isDarkMode ? 'text-white/20' : 'text-black/10'}`}>02</span>
                <h4 className={`font-display font-semibold text-lg mb-2 ${themeClasses.textMain}`}>Setup Portfolio</h4>
                <p className={`text-sm ${themeClasses.textSub}`}>Link a virtual or live account representing your initial trading size values cleanly.</p>
              </div>
            </div>

            <div className={`p-6 rounded border text-left flex flex-col justify-between ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
              <div>
                <span className={`text-3xl font-mono block mb-4 ${isDarkMode ? 'text-white/20' : 'text-black/10'}`}>03</span>
                <h4 className={`font-display font-semibold text-lg mb-2 ${themeClasses.textMain}`}>Log & Excel</h4>
                <p className={`text-sm ${themeClasses.textSub}`}>Quickly feed executions, notes, and custom psychological states into optimized graphs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table Section */}
        <div id="comparison" className="w-full max-w-5xl mt-28 fade-in-on-scroll">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Better Architecture</span>
            <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight mt-2 ${themeClasses.textMain}`}>
              Engineered directly for high frequency logging
            </h2>
          </div>

          <div className="w-full overflow-x-auto border border-inherit rounded-lg">
            <table className="w-full text-left border-collapse min-w-[600px] font-mono text-sm">
              <thead>
                <tr className={`border-b border-inherit ${isDarkMode ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
                  <th className={`p-4 font-bold ${themeClasses.textMain}`}>Feature Matrix</th>
                  <th className={`p-4 font-bold ${themeClasses.textMain}`}>Journalist</th>
                  <th className="p-4 text-neutral-500 font-medium">Traditional Spreadsheets</th>
                  <th className="p-4 text-neutral-500 font-medium">Standard Notion Docs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                <tr>
                  <td className={`p-4 font-semibold ${themeClasses.textMain}`}>Interactive Equity Curves</td>
                  <td className="p-4 text-green-500 font-bold">✓ (Real-time Recharts)</td>
                  <td className="p-4 text-neutral-500">✗ Manual Static Charts</td>
                  <td className="p-4 text-neutral-500">✗ No Chart Support</td>
                </tr>
                <tr>
                  <td className={`p-4 font-semibold ${themeClasses.textMain}`}>Psychology Correlators</td>
                  <td className="p-4 text-green-500 font-bold">✓ (Greed/FOMO tags)</td>
                  <td className="p-4 text-neutral-500">✗ Hard to log</td>
                  <td className="p-4 text-neutral-500">✗ Text-only descriptions</td>
                </tr>
                <tr>
                  <td className={`p-4 font-semibold ${themeClasses.textMain}`}>Keyboard Shortcuts (Cmd+K)</td>
                  <td className="p-4 text-green-500 font-bold">✓ Complete terminal</td>
                  <td className="p-4 text-neutral-500">✗ Basic cell navigations</td>
                  <td className="p-4 text-neutral-500">✗ Slow cursor point/click</td>
                </tr>
                <tr>
                  <td className={`p-4 font-semibold ${themeClasses.textMain}`}>SQLite Secure Backends</td>
                  <td className="p-4 text-green-500 font-bold">✓ Encrypted endpoints</td>
                  <td className="p-4 text-neutral-500">✗ Local file risk</td>
                  <td className="p-4 text-neutral-500">✗ Shared server clusters</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials Grid Section */}
        <div className="w-full max-w-5xl mt-28 fade-in-on-scroll">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Trader Feedback</span>
            <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight mt-2 ${themeClasses.textMain}`}>
              Adopted by top retail and fund performers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className={`p-6 rounded border flex flex-col justify-between ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
              <p className={`text-sm italic leading-relaxed ${themeClasses.textSub}`}>
                "The monochromatic minimal theme completely reduced chart fatigue. Being able to access the command palette with CMD+K to log rapid scalps is revolutionary."
              </p>
              <div className="flex items-center space-x-3 mt-6">
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  AN
                </div>
                <div>
                  <h5 className={`text-sm font-semibold ${themeClasses.textMain}`}>Alex N.</h5>
                  <span className="text-[10px] text-neutral-500 font-mono">Prop Firm Scalper</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded border flex flex-col justify-between ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
              <p className={`text-sm italic leading-relaxed ${themeClasses.textSub}`}>
                "I was skeptical about shifting away from Excel tables, but the real-time calculations of Profit Factor and visual R-Multiple charts won me over in days."
              </p>
              <div className="flex items-center space-x-3 mt-6">
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  MS
                </div>
                <div>
                  <h5 className={`text-sm font-semibold ${themeClasses.textMain}`}>Marcus S.</h5>
                  <span className="text-[10px] text-neutral-500 font-mono">Futures Swing Trader</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded border flex flex-col justify-between ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
              <p className={`text-sm italic leading-relaxed ${themeClasses.textSub}`}>
                "The psychological tagging features helped me discover a direct correlation between lack of focus/FOMO states and loss patterns. Highly recommended!"
              </p>
              <div className="flex items-center space-x-3 mt-6">
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  KL
                </div>
                <div>
                  <h5 className={`text-sm font-semibold ${themeClasses.textMain}`}>Karen L.</h5>
                  <span className="text-[10px] text-neutral-500 font-mono">Crypto Portfolio Manager</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Sections */}
        <div id="pricing" className="w-full max-w-5xl mt-28 fade-in-on-scroll">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Clear Pricing</span>
            <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight mt-2 ${themeClasses.textMain}`}>
              Scale your analytical workspace easily
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className={`p-8 rounded-lg border text-left flex flex-col justify-between relative ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'}`}>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Sandbox Core</span>
                <h4 className={`text-3xl font-extrabold font-mono mt-2 ${themeClasses.textMain}`}>$0 <span className="text-xs text-neutral-500 font-sans">/ forever</span></h4>
                <p className={`text-sm mt-4 ${themeClasses.textSub}`}>Perfect for beginners and guest explorers looking to track clean trading analytics locally.</p>

                <ul className="space-y-3 text-xs font-mono mt-8 border-t border-neutral-800 pt-6">
                  <li className="flex items-center gap-2 text-neutral-400"><Check className="w-3.5 h-3.5 text-green-500" /> Log Unlimited Local Trades</li>
                  <li className="flex items-center gap-2 text-neutral-400"><Check className="w-3.5 h-3.5 text-green-500" /> Essential Recharts Dashboards</li>
                  <li className="flex items-center gap-2 text-neutral-400"><Check className="w-3.5 h-3.5 text-green-500" /> Interactive Cursor Follower</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setUser(null);
                  navigate('/dashboard');
                }}
                className={`w-full py-3 border font-medium tracking-tight rounded mt-8 text-sm text-center ${themeClasses.bgPanel} ${themeClasses.border} ${themeClasses.bgHover}`}
              >
                Start Guest Explorer
              </button>
            </div>

            <div className={`p-8 rounded-lg border text-left flex flex-col justify-between relative overflow-hidden ${isDarkMode ? 'bg-white text-black border-transparent' : 'bg-black text-white border-transparent'}`}>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest opacity-60">Pro Terminal</span>
                <h4 className="text-3xl font-extrabold font-mono mt-2">$29 <span className="text-xs opacity-60 font-sans">/ monthly</span></h4>
                <p className="text-sm mt-4 opacity-80">Full synchronized backend cloud backups, custom accounts support, and complete priority integrations.</p>

                <ul className="space-y-3 text-xs font-mono mt-8 border-t border-neutral-700 pt-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /> Multi-device Sync & JWT auth</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /> Dynamic Profit Factor metrics</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /> Multi-account Management</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /> Priority API Integration support</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/auth')}
                className={`w-full py-3 font-semibold tracking-tight rounded mt-8 text-sm text-center transition ${isDarkMode ? 'bg-black text-white hover:bg-neutral-800' : 'bg-white text-black hover:bg-neutral-200'}`}
              >
                Unlock Pro Features
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div id="faq" className="w-full max-w-3xl mt-28 fade-in-on-scroll">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Got Questions?</span>
            <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight mt-2 ${themeClasses.textMain}`}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 text-left">
            {faqQuestions.map((item, idx) => (
              <div key={idx} className={`border rounded-lg overflow-hidden transition ${themeClasses.border} ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex justify-between items-center text-sm font-semibold tracking-tight focus:outline-none"
                >
                  <span className={themeClasses.textMain}>{item.q}</span>
                  <span className={`text-neutral-500 transform transition-transform ${faqOpen[idx] ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {faqOpen[idx] && (
                  <div className="p-5 border-t border-inherit text-xs leading-relaxed text-neutral-400 font-mono">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className={`w-full border-t py-8 text-center text-xs font-mono bg-transparent z-10 relative ${themeClasses.border} ${themeClasses.textSub}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} />
            <span>Local Encryption & Security Synchronization Enabled</span>
          </div>
          <span>© 2026 Journalist SaaS, Inc. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
