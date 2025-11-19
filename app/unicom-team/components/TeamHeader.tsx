// src/app/unicom-team/components/TeamHeader.tsx
"use client";

import { useTheme } from "../../contexts/ThemeContext";
import Link from "next/link";
import {
  Home,
  Users,
  FolderOpen,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

interface TeamHeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function TeamHeader({
  activeView,
  setActiveView,
}: TeamHeaderProps) {
  const { colors, gradients, isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(3);

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "members", label: "Members", icon: Users },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <header
      className={`sticky top-0 z-40 ${colors.card.background} border-b ${
        isDark ? "border-amber-500/20" : "border-amber-300/60"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600`}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <span
                className={`text-xl font-bold bg-gradient-to-r ${gradients.heading.primary} bg-clip-text text-transparent hidden sm:block`}
              >
                Unicom Team
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                      ${
                        activeView === item.id
                          ? `bg-gradient-to-r ${colors.form.button} text-white`
                          : `${colors.text.muted} hover:${colors.text.primary}`
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 inline mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${colors.text.muted}`}
                />
                <input
                  type="text"
                  placeholder="Search team..."
                  className={`
                    pl-10 pr-4 py-2 rounded-lg text-sm
                    ${isDark ? "bg-gray-800/50" : "bg-gray-50"}
                    ${colors.text.primary}
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50
                    transition-all duration-300
                    w-64
                  `}
                />
              </div>
            </div>

            {/* Notifications */}
            <button
              className={`
                relative p-2 rounded-lg transition-all duration-300
                ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}
              `}
            >
              <Bell className={`w-5 h-5 ${colors.text.muted}`} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                p-2 rounded-lg transition-all duration-300
                ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}
              `}
            >
              {isDark ? (
                <Sun className={`w-5 h-5 ${colors.text.muted}`} />
              ) : (
                <Moon className={`w-5 h-5 ${colors.text.muted}`} />
              )}
            </button>

            {/* Settings */}
            <button
              className={`
                p-2 rounded-lg transition-all duration-300
                ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}
              `}
            >
              <Settings className={`w-5 h-5 ${colors.text.muted}`} />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold`}
              >
                JD
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`
                lg:hidden p-2 rounded-lg transition-all duration-300
                ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}
              `}
            >
              {isMobileMenuOpen ? (
                <X className={`w-5 h-5 ${colors.text.primary}`} />
              ) : (
                <Menu className={`w-5 h-5 ${colors.text.primary}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-amber-500/20">
            <nav className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      px-4 py-3 rounded-lg font-medium text-sm text-left transition-all duration-300
                      ${
                        activeView === item.id
                          ? `bg-gradient-to-r ${colors.form.button} text-white`
                          : `${colors.text.muted} hover:${colors.text.primary}`
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 inline mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Search */}
            <div className="mt-4 relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${colors.text.muted}`}
              />
              <input
                type="text"
                placeholder="Search team..."
                className={`
                  w-full pl-10 pr-4 py-3 rounded-lg text-sm
                  ${isDark ? "bg-gray-800/50" : "bg-gray-50"}
                  ${colors.text.primary}
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50
                  transition-all duration-300
                `}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
