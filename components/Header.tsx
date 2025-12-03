import React from 'react';
import { Coins } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  credits: number;
  theme: Theme;
}

const Header: React.FC<HeaderProps> = ({ credits, theme }) => {
  return (
    <header className={`fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-colors duration-500`}>
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <span className={`font-bold text-lg tracking-tight ${theme.accentColor}`}>Mission Bridge</span>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-100`}>
          <Coins size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-gray-700 text-sm">{credits.toLocaleString()} C</span>
        </div>
      </div>
    </header>
  );
};

export default Header;