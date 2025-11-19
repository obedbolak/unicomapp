// src/app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "./contexts/ThemeContext";
import {
  Building2,
  Users,
  Briefcase,
  ShoppingCart,
  Landmark,
  Search,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Bell,
  Star,
  ChevronRight,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { colors, gradients, isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dashboards = [
    {
      title: "Real Estate",
      description: "Manage properties, agents, and analytics",
      icon: Building2,
      href: "/real-estate",
      gradient: "from-amber-500 to-yellow-600",
      status: "coming-soon",
      features: [
        "Property Listings",
        "Agent Management",
        "Analytics Dashboard",
        "Virtual Tours",
      ],
      stats: { users: "2.5K", properties: "15K", transactions: "$50M" },
      keywords: [
        "property",
        "real estate",
        "house",
        "apartment",
        "agent",
        "listing",
      ],
      callToAction: "Explore Properties →",
      badge: "New Features",
    },
    {
      title: "Unicom Team",
      description: "Collaborate with members and track projects",
      icon: Users,
      href: "/unicom-team",
      gradient: "from-yellow-500 to-amber-600",
      status: "active",
      features: [
        "Team Collaboration",
        "Project Tracking",
        "Task Management",
        "Real-time Chat",
      ],
      stats: { teams: "500+", projects: "1.2K", members: "5K" },
      keywords: [
        "team",
        "unicom",
        "collaboration",
        "project",
        "member",
        "task",
      ],
      callToAction: "Start Collaborating →",
      badge: "Popular",
    },
    {
      title: "Services",
      description: "Book services and manage providers",
      icon: Briefcase,
      href: "/services",
      gradient: "from-amber-600 to-orange-600",
      status: "coming-soon",
      features: [
        "Service Booking",
        "Provider Dashboard",
        "Reviews & Ratings",
        "Payment Integration",
      ],
      stats: { services: "100+", providers: "3K", bookings: "25K" },
      keywords: ["service", "booking", "provider", "appointment", "schedule"],
      callToAction: "Browse Services →",
      badge: "Coming Q2 2024",
    },
    {
      title: "E-Commerce",
      description: "Products, orders, and inventory management",
      icon: ShoppingCart,
      href: "/ecommerce",
      gradient: "from-yellow-600 to-amber-700",
      status: "coming-soon",
      features: [
        "Product Catalog",
        "Order Management",
        "Inventory Tracking",
        "Payment Gateway",
      ],
      stats: { products: "10K", orders: "50K", revenue: "$5M" },
      keywords: [
        "shop",
        "ecommerce",
        "product",
        "cart",
        "order",
        "store",
        "buy",
        "sell",
      ],
      callToAction: "Start Selling →",
      badge: "Beta",
    },
    {
      title: "Banking",
      description: "Accounts, transactions, and payments",
      icon: Landmark,
      href: "/banking",
      gradient: "from-amber-700 to-yellow-700",
      status: "coming-soon",
      features: [
        "Account Management",
        "Transaction History",
        "Bill Payments",
        "Money Transfer",
      ],
      stats: { accounts: "8K", transactions: "100K", volume: "$25M" },
      keywords: [
        "bank",
        "payment",
        "transaction",
        "account",
        "money",
        "transfer",
        "finance",
      ],
      callToAction: "Manage Finances →",
      badge: "Secure",
    },
  ];

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate search delay for better UX
    setTimeout(() => {
      const results = dashboards.filter(
        (dashboard) =>
          dashboard.title.toLowerCase().includes(query.toLowerCase()) ||
          dashboard.description.toLowerCase().includes(query.toLowerCase()) ||
          dashboard.keywords.some((keyword) =>
            keyword.toLowerCase().includes(query.toLowerCase())
          )
      );
      setSearchResults(results);
      setIsSearching(false);

      if (results.length === 0) {
        showToast("No results found. Try different keywords!");
      }
    }, 500);
  };

  // Toggle search bar
  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (!showSearchBar) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // Handle dashboard click
  const handleDashboardClick = (e: React.MouseEvent, dashboard: any) => {
    e.preventDefault();

    if (dashboard.status === "active") {
      // Navigate to Unicom Team
      showToast(`Welcome to ${dashboard.title}! 🎉`);
      setTimeout(() => {
        window.location.href = dashboard.href;
      }, 1000);
    } else {
      // Show coming soon modal
      setSelectedDashboard(dashboard);
      setShowComingSoon(true);
    }
  };

  // Show toast notification
  const showToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Close coming soon modal
  const closeComingSoonModal = () => {
    setShowComingSoon(false);
    setSelectedDashboard(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchBar(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
      // Escape to close modal or search
      if (e.key === "Escape") {
        if (showComingSoon) {
          closeComingSoonModal();
        }
        if (showSearchBar) {
          setShowSearchBar(false);
          setSearchQuery("");
          setSearchResults([]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showComingSoon, showSearchBar]);

  // Welcome message on load
  useEffect(() => {
    setTimeout(() => {
      showToast("👋 Welcome! Click on any dashboard to explore our services!");
    }, 1000);
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${colors.background.main} relative overflow-hidden`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 -right-32 w-96 h-96 bg-gradient-to-br ${colors.background.orb1} rounded-full blur-3xl animate-pulse`}
        />
        <div
          className={`absolute bottom-0 -left-32 w-96 h-96 bg-gradient-to-br ${colors.background.orb2} rounded-full blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br ${colors.background.orb3} rounded-full blur-3xl animate-pulse`}
          style={{ animationDelay: "2s" }}
        />

        {/* Additional floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-yellow-500/20 rounded-full blur-2xl animate-float-delayed" />
      </div>

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-0">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              priority
            />
            <span
              className={`text-2xl font-bold bg-gradient-to-r ${gradients.heading.primary} bg-clip-text text-transparent`}
            >
              nicom
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSearchBar}
              className={`p-2 rounded-xl ${colors.card.background} ${
                colors.card.hover
              } backdrop-blur-lg transition-all duration-300 ${
                showSearchBar ? "ring-2 ring-yellow-500" : ""
              }`}
              title="Search (Cmd+K)"
            >
              <Search className={`w-5 h-5 ${colors.text.primary}`} />
            </button>
            <button
              onClick={() => showToast("🔔 No new notifications")}
              className={`p-2 rounded-xl ${colors.card.background} ${colors.card.hover} backdrop-blur-lg transition-all duration-300`}
            >
              <Bell className={`w-5 h-5 ${colors.text.primary}`} />
            </button>
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${colors.card.background} ${colors.card.hover} ${colors.text.primary} backdrop-blur-lg`}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Search Bar */}
      {showSearchBar && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-32 px-6 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl">
            <div
              className={`relative group ${colors.card.background} rounded-2xl p-2 backdrop-blur-lg shadow-2xl animate-slide-down`}
            >
              <div className="flex items-center gap-3">
                <Search className={`w-6 h-6 ${colors.text.muted} ml-4`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for services, features, or dashboards..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`flex-1 py-4 pr-4 bg-transparent ${colors.text.primary} placeholder:${colors.text.muted} outline-none text-lg`}
                />
                {isSearching && (
                  <Loader2
                    className={`w-6 h-6 ${colors.text.accent} animate-spin mr-4`}
                  />
                )}
                <button
                  onClick={toggleSearchBar}
                  className={`p-2 rounded-lg ${colors.card.hover} mr-2 transition-all duration-300`}
                >
                  <X className={`w-5 h-5 ${colors.text.muted}`} />
                </button>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div
                className={`absolute z-20 w-full max-w-2xl mt-2 ${colors.card.background} rounded-xl shadow-2xl backdrop-blur-lg overflow-hidden animate-slide-down`}
              >
                {searchResults.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        handleDashboardClick(e, result);
                        toggleSearchBar();
                      }}
                      className={`w-full p-4 flex items-center gap-4 ${colors.card.hover} transition-all duration-300 border-b last:border-0 ${colors.text.primary}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${result.gradient} flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold">{result.title}</h4>
                        <p className={`text-sm ${colors.text.muted}`}>
                          {result.description}
                        </p>
                      </div>
                      {result.status === "active" ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-semibold">
                          Coming Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20">
        {/* Hero Section */}
        <div className="w-full max-w-6xl mx-auto text-center mb-12">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Zap className="w-10 h-10 text-yellow-500 animate-pulse" />
              <h1
                className={`text-5xl md:text-7xl font-bold bg-gradient-to-r ${gradients.heading.primary} bg-clip-text text-transparent animate-fade-in`}
              >
                Multi-Dashboard Platform
              </h1>
              <Zap
                className="w-10 h-10 text-yellow-500 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
            <p
              className={`text-xl md:text-2xl ${colors.text.secondary} max-w-3xl mx-auto animate-fade-in-delay mb-8`}
            >
              Your all-in-one solution for business management. Choose your
              dashboard and get started!
            </p>

            {/* Quick Access Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setShowSearchBar(true)}
                className={`px-6 py-3 rounded-xl font-medium ${colors.card.background} ${colors.card.hover} ${colors.text.primary} backdrop-blur-lg flex items-center gap-2 transform hover:scale-105 transition-all duration-300`}
              >
                <Search className="w-4 h-4" />
                Quick Search (⌘K)
              </button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-lg">
                <Shield className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${colors.text.muted}`}>
                  Secure & Trusted
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-lg">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className={`text-sm ${colors.text.muted}`}>
                  4.9/5 Rating
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid - More Appealing */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {dashboards.map((dashboard, index) => {
            const Icon = dashboard.icon;
            return (
              <div
                key={dashboard.title}
                onClick={(e) => handleDashboardClick(e, dashboard)}
                className={`group relative p-6 rounded-2xl transition-all duration-500 ${colors.card.background} ${colors.card.hover} transform hover:scale-105 hover:-translate-y-2 cursor-pointer animate-fade-in-up backdrop-blur-lg overflow-hidden`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background Gradient on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${dashboard.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Status/Feature Badge */}
                <div className="absolute top-4 right-4">
                  {dashboard.status === "active" ? (
                    <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-lg">
                      {dashboard.badge}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${dashboard.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3
                  className={`text-2xl font-bold mb-3 bg-gradient-to-r ${gradients.heading.secondary} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}
                >
                  {dashboard.title}
                </h3>

                <p className={`${colors.text.muted} text-sm mb-4 line-clamp-2`}>
                  {dashboard.description}
                </p>

                {/* Key Features with Icons */}
                <div className="space-y-2 mb-4">
                  {dashboard.features.slice(0, 3).map((feature, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-xs ${colors.text.muted} group-hover:${colors.text.primary} transition-colors duration-300`}
                    >
                      <Sparkles
                        className={`w-3 h-3 ${
                          dashboard.status === "active"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Call to Action Button */}
                <div
                  className={`flex items-center justify-between pt-4 border-t ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <span
                    className={`text-sm font-bold bg-gradient-to-r ${dashboard.gradient} bg-clip-text text-transparent`}
                  >
                    {dashboard.callToAction}
                  </span>
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${dashboard.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover Effect Indicator */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${dashboard.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                />
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="w-full max-w-4xl mx-auto text-center">
          <div
            className={`p-8 rounded-2xl ${colors.card.background} ${colors.card.hover} backdrop-blur-lg`}
          >
            <h2
              className={`text-3xl font-bold mb-4 bg-gradient-to-r ${gradients.heading.primary} bg-clip-text text-transparent`}
            >
              Ready to Transform Your Business?
            </h2>
            <p className={`${colors.text.secondary} mb-6 max-w-2xl mx-auto`}>
              Join thousands of businesses already using our platform to
              streamline operations and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/unicom-team"
                className={`px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${colors.form.button} shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}
              >
                Start with Unicom Team
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() =>
                  showToast("📧 Contact our sales team at sales@unicom.com")
                }
                className={`px-8 py-3 rounded-xl font-semibold ${colors.card.background} ${colors.card.hover} ${colors.text.primary} transform hover:scale-105 transition-all duration-300`}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Coming Soon Modal */}
      {showComingSoon && selectedDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`relative max-w-lg w-full p-8 rounded-2xl ${colors.card.background} backdrop-blur-lg shadow-2xl animate-slide-up`}
          >
            <button
              onClick={closeComingSoonModal}
              className={`absolute top-4 right-4 p-2 rounded-lg ${colors.card.hover} transition-all duration-300`}
            >
              <X className={`w-5 h-5 ${colors.text.muted}`} />
            </button>

            <div className="text-center">
              <div
                className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${selectedDashboard.gradient} flex items-center justify-center mb-6 animate-bounce`}
              >
                <selectedDashboard.icon className="w-10 h-10 text-white" />
              </div>

              <h3
                className={`text-2xl font-bold mb-3 bg-gradient-to-r ${gradients.heading.primary} bg-clip-text text-transparent`}
              >
                {selectedDashboard.title} - Coming Soon!
              </h3>

              <p className={`${colors.text.secondary} mb-6`}>
                We're working hard to bring you this amazing feature. Be the
                first to know when it launches!
              </p>

              {/* Features List */}
              <div
                className={`text-left p-4 rounded-xl ${
                  isDark ? "bg-gray-800/50" : "bg-gray-100/50"
                } mb-6`}
              >
                <h4 className={`font-semibold mb-3 ${colors.text.primary}`}>
                  What's Coming:
                </h4>
                <div className="space-y-2">
                  {selectedDashboard.features.map(
                    (feature: string, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-sm ${colors.text.muted}`}
                      >
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span>{feature}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Email Subscription */}
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email for updates"
                  className={`flex-1 px-4 py-3 rounded-xl ${
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  } ${
                    colors.text.primary
                  } outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300`}
                />
                <button
                  onClick={() => {
                    showToast("✅ You'll be notified when this launches!");
                    closeComingSoonModal();
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${colors.form.button} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-xl ${colors.card.background} backdrop-blur-lg shadow-2xl flex items-center gap-3`}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={`${colors.text.primary} font-medium`}>
              {notificationMessage}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-10deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}
