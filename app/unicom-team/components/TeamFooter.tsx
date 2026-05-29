// src/app/unicom-team/components/TeamFooter.tsx
"use client";

import { useTheme } from "../../contexts/ThemeContext";
import Link from "next/link";
import {
  Twitter,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  HelpCircle,
  FileText,
  Shield,
  Users,
} from "lucide-react";

export default function TeamFooter() {
  const { colors, gradients, isDark } = useTheme();

  const footerLinks = {
    product: [
      { label: "Features", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
    resources: [
      { label: "Documentation", href: "#", icon: FileText },
      { label: "Help Center", href: "#", icon: HelpCircle },
      { label: "Community", href: "#", icon: MessageCircle },
      { label: "Security", href: "#", icon: Shield },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
  ];

  return (
    <footer
      className={`mt-20 ${colors.card.background} border-t ${
        isDark ? "border-amber-500/20" : "border-amber-300/60"
      }`}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600`}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <span
                className={`text-xl font-bold bg-gradient-to-r ${gradients.heading.primary} bg-clip-text text-transparent`}
              >
                Unicom Team
              </span>
            </div>
            <p className={`${colors.text.muted} text-sm mb-4`}>
              Empowering teams to collaborate better and achieve more together.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`
                      p-2 rounded-lg transition-all duration-300
                      ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}
                      ${colors.text.muted} hover:${colors.text.primary}
                    `}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className={`font-semibold ${colors.text.primary} mb-4`}>
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`${colors.text.muted} hover:${colors.text.accent} text-sm transition-colors duration-300`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className={`font-semibold ${colors.text.primary} mb-4`}>
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`${colors.text.muted} hover:${colors.text.accent} text-sm transition-colors duration-300`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className={`font-semibold ${colors.text.primary} mb-4`}>
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`${colors.text.muted} hover:${colors.text.accent} text-sm transition-colors duration-300 flex items-center gap-2`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className={`font-semibold ${colors.text.primary} mb-4`}>
              Contact
            </h3>
            <ul className="space-y-3">
              <li
                className={`flex items-center gap-2 ${colors.text.muted} text-sm`}
              >
                <Mail className="w-4 h-4" />
                team@unicom.com
              </li>
              <li
                className={`flex items-center gap-2 ${colors.text.muted} text-sm`}
              >
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </li>
              <li
                className={`flex items-start gap-2 ${colors.text.muted} text-sm`}
              >
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  123 Business Ave
                  <br />
                  San Francisco, CA 94105
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div
          className={`p-6 rounded-xl mb-8 ${
            isDark ? "bg-gray-800/50" : "bg-gray-50"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className={`font-semibold ${colors.text.primary} mb-1`}>
                Stay updated with our newsletter
              </h3>
              <p className={`${colors.text.muted} text-sm`}>
                Get the latest updates and news delivered to your inbox
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={`
                  flex-1 md:w-64 px-4 py-2 rounded-lg text-sm
                  ${isDark ? "bg-gray-900/50" : "bg-white"}
                  ${colors.text.primary}
                  border ${
                    isDark ? "border-amber-500/30" : "border-amber-300/60"
                  }
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50
                  transition-all duration-300
                `}
              />
              <button
                className={`
                  px-6 py-2 rounded-lg font-medium text-sm text-white
                  bg-gradient-to-r ${colors.form.button}
                  hover:scale-105 transition-all duration-300
                `}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`pt-8 border-t ${
            isDark ? "border-amber-500/10" : "border-amber-300/30"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className={`${colors.text.muted} text-sm`}>
              © 2024 Unicom Team. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`${colors.text.muted} hover:${colors.text.accent} text-sm transition-colors duration-300`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
