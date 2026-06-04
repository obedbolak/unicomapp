"use client";

import { motion } from "framer-motion";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us, such as your name, email address, and project details when you fill out our contact form or engage our services. We may also collect usage data through analytics tools.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use the information we collect to communicate with you about your project, deliver our services, send relevant updates, and improve our offerings. We do not sell your personal data to third parties.",
  },
  {
    title: "Cookies & Tracking",
    content:
      "Our website may use cookies and similar technologies to enhance your browsing experience and gather analytics. You can control cookie settings through your browser preferences at any time.",
  },
  {
    title: "Data Sharing",
    content:
      "We may share your information with trusted third-party service providers (e.g., hosting, analytics) strictly to operate our business. All third parties are required to maintain the confidentiality of your data.",
  },
  {
    title: "Data Retention",
    content:
      "We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy or as required by law. You may request deletion of your data at any time.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time by contacting us or using the unsubscribe link in our emails.",
  },
  {
    title: "Security",
    content:
      "We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use of our services constitutes acceptance.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="section-page">
      <div className="container-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span className="section-eyebrow">Legal</span>
          <h1 className="section-heading" style={{ color: "var(--color-text)" }}>
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: 0, maxWidth: "620px" }}>
            Your privacy matters to us. This policy explains how UnicomTeam
            collects, uses, and protects your information. Last updated:{" "}
            <span style={{ color: "var(--color-primary)" }}>June 2025</span>
          </p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "800px" }}>
          {sections.map(({ title, content }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="card"
              style={{ padding: "1.5rem 2rem" }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--color-text)",
                  marginBottom: "0.5rem",
                }}
              >
                {i + 1}. {title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.7,
                }}
              >
                {content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            marginTop: "2.5rem",
            maxWidth: "800px",
            padding: "1.25rem 1.5rem",
            borderRadius: "1rem",
            background: "rgba(255,140,0,0.05)",
            border: "1px solid rgba(255,140,0,0.12)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.6,
            }}
          >
            Questions about your data?{" "}
            <a href="/contact" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
              Contact us →
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
