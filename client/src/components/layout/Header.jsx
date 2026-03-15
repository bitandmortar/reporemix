import React from 'react';
import { clsx } from 'clsx';
import { GitFork, Star, Activity, Zap } from 'lucide-react';

/**
 * Header Component
 * 
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes
 */
export function Header({ className }) {
  return (
    <header className={clsx('sticky top-0 z-50 w-full border-b border-[#2a2f3e] bg-[#0b0f19]/80 backdrop-blur-xl', className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffd166] to-[#0ef0c9]">
              <GitFork className="h-6 w-6 text-[#0b0f19]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RepoRemix</h1>
              <p className="text-xs text-[#6b7280]">GitHub Network Analytics</p>
            </div>
          </div>
          
          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-medium text-[#9ca3af] hover:text-[#ffd166] transition-colors">
              Dashboard
            </a>
            <a href="/graph" className="text-sm font-medium text-[#9ca3af] hover:text-[#ffd166] transition-colors">
              Graph
            </a>
            <a href="/kanban" className="text-sm font-medium text-[#9ca3af] hover:text-[#ffd166] transition-colors">
              Kanban
            </a>
            <a href="/analytics" className="text-sm font-medium text-[#9ca3af] hover:text-[#ffd166] transition-colors">
              Analytics
            </a>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4 text-xs text-[#6b7280]">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>128</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                <span>42</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span>Active</span>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-[#ffd166] text-[#0b0f19] rounded-lg font-medium hover:bg-[#ffea66] transition-colors">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
