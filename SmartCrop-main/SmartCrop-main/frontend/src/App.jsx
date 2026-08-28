import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import OfficerLogin from './pages/OfficerLogin';
import FarmerChat from './pages/FarmerChat';
import FarmerDashboard from './pages/FarmerDashboard';
import { Globe, Bot, User, LogOut, Phone, Settings, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOfficer = location.pathname.includes('officer');
  const isFarmer = location.pathname.includes('farmer') || location.pathname.includes('chat') || location.pathname.includes('dashboard');
  const { lang, changeLanguage, t } = useLanguage();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('smartCropToken');
    localStorage.removeItem('smartCropRole');
    setShowProfileMenu(false);
    navigate('/farmer-login');
  };

  const handleTriggerChat = () => {
    window.dispatchEvent(new CustomEvent('toggleSmartAssistant'));
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-200 transition-colors w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center min-w-0 pr-2">
            <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 group">
              <span className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${isOfficer ? 'text-blue-600 group-hover:text-blue-700' : 'text-green-700 group-hover:text-green-800'}`}>
                {t('nav_brand')}
              </span>
              {isOfficer && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 truncate">
                  {t('nav_portal')}
                </span>
              )}
              {isFarmer && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-800 border border-green-200 truncate">
                  {t('nav_farmer')}
                </span>
              )}
            </Link>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Language Selector */}
            <div className="flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 sm:px-2.5 py-1 transition-colors">
              <Globe className="h-3.5 w-3.5 mr-1 text-gray-500 flex-shrink-0" />
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label={t('language')}
                className="bg-transparent text-xs text-gray-800 font-medium focus:outline-hidden cursor-pointer border-none pr-1"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="or">ଓଡ଼ିଆ</option>
              </select>
            </div>

            {/* Smart Assistant Toggle Button */}
            <button
              onClick={handleTriggerChat}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all border border-emerald-500"
              title="Open Smart AI Assistant"
            >
              <Bot className="h-4 w-4 text-emerald-200 animate-bounce" />
              <span className="hidden sm:inline">Smart Assistant</span>
            </button>

            {/* Home Link */}
            <Link 
              to="/" 
              className="text-xs font-semibold text-gray-700 hover:text-green-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t('home')}
            </Link>

            {/* Profile Dropdown Icon Button */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-800 p-1.5 rounded-full border border-gray-300 transition-colors"
                title="Account & Profile Options"
              >
                <User className="h-4 w-4 text-emerald-700" />
                <ChevronDown className="h-3 w-3 text-gray-500" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 py-2 text-slate-800 divide-y divide-gray-100">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-gray-900">Farmer Account</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Krushi Shayaka Verified</p>
                  </div>

                  <div className="px-4 py-2 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Toll-Free Helplines</p>
                    <div className="flex items-center text-xs font-semibold text-gray-700 py-0.5">
                      <Phone className="h-3.5 w-3.5 text-green-600 mr-2 shrink-0" />
                      <span>Krushi Helpline: <strong>1800-180-1551</strong></span>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-gray-700 py-0.5">
                      <Phone className="h-3.5 w-3.5 text-blue-600 mr-2 shrink-0" />
                      <span>Kisan Call Center: <strong>1551</strong></span>
                    </div>
                  </div>

                  <div className="px-2 py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        window.dispatchEvent(new CustomEvent('openLoanModal'));
                      }}
                      className="w-full flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 mr-2 text-gray-500" />
                      <span>Loan & Financial Settings</span>
                    </button>
                  </div>

                  <div className="px-2 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 transition-colors text-gray-900 w-full">
          <Navbar />
          <main className="w-full">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/officer-login" element={<OfficerLogin />} />
              <Route path="/officer-dashboard" element={<Dashboard />} />
              <Route path="/farmer-login" element={<Login />} />
              <Route path="/chat" element={<FarmerChat />} />
              <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
