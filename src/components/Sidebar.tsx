import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  MessageSquareText, 
  TrendingUp, 
  Lightbulb, 
  History, 
  Settings, 
  FlaskConical,
  ShieldCheck,
  Cpu,
  LogOut
} from 'lucide-react';
import { LogoMark } from './Logo';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  documentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, documentCount }) => {
  const { user, logout } = useAuth();
  const initials = (user?.name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: Files, badge: documentCount > 0 ? documentCount : undefined },
    { id: 'analyst', label: 'AI Analyst', icon: MessageSquareText },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations & Plan', icon: Lightbulb },
    { id: 'scenario', label: 'Scenario Lab', icon: FlaskConical },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
          <LogoMark className="w-9 h-9 shrink-0 [filter:drop-shadow(0_6px_10px_rgba(99,102,241,0.25))]" />
          <div>
            <h1 className="font-bold text-slate-100 text-base tracking-tight flex items-center gap-1.5">
              DocuMind <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono font-medium">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Understand. Prove. Decide.</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footers */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2.5">
        {/* Signed-in user */}
        {user && (
          <div className="flex items-center gap-3 pb-3 mb-1 border-b border-slate-800/60">
            <div
              className="w-9 h-9 shrink-0 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-indigo-200 text-xs font-semibold flex items-center justify-center"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-100 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.is_demo ? 'Demo account' : user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Engine
          </span>
          <span className="text-emerald-400 font-mono font-medium text-[11px]">Online (FastAPI)</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-indigo-400" />
            AI Core
          </span>
          <span className="text-indigo-400 font-mono font-medium text-[11px]">Gemini 2.5 / VLM</span>
        </div>

        <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 text-center font-mono">
          HackNex 2026 • HNX26PSI01
        </div>
      </div>
    </aside>
  );
};
