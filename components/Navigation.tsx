import React from 'react';
import { Home, ListChecks, MessageCircleHeart, ShoppingBag } from 'lucide-react';
import { Tab, Theme } from '../types';

interface NavigationProps {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  theme: Theme;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab, theme }) => {
  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: '홈', icon: <Home size={24} /> },
    { id: 'missions', label: '미션', icon: <ListChecks size={24} /> },
    { id: 'social', label: '소셜', icon: <MessageCircleHeart size={24} /> },
    { id: 'shop', label: '상점', icon: <ShoppingBag size={24} /> },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? theme.accentColor : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;