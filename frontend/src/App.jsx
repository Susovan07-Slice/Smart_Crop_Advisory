import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import OfficerLogin from './pages/OfficerLogin';
import FarmerChat from './pages/FarmerChat';
import FarmerDashboard from './pages/FarmerDashboard';
import { Globe } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isOfficer = location.pathname.includes('officer');
  const isFarmer = location.pathname.includes('farmer') || location.pathname.includes('chat') || location.pathname.includes('dashboard');
  const { lang, changeLanguage, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-200 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
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
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Language Selector */}
            <div className="flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 transition-colors">
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-gray-500 flex-shrink-0" />
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label={t('language')}
                className="bg-transparent text-xs sm:text-sm text-gray-800 font-medium focus:outline-hidden cursor-pointer border-none pr-1"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="or">ଓଡ଼ିଆ</option>
              </select>
            </div>


            {/* Home Navigation Link */}
            <Link 
              to="/" 
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t('home')}
            </Link>
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
        <div className="min-h-screen bg-gray-100 transition-colors text-gray-900">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Landing />} />
                
                {/* Officer Flow */}
                <Route path="/officer-login" element={<OfficerLogin />} />
                <Route path="/officer-dashboard" element={<Dashboard />} />
                
                {/* Farmer Flow */}
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
