"use client";

import { motion } from "framer-motion";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using UnicomTeam's services, website, or any associated platforms, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
  },
  {
    title: "Services",
    content:
      "UnicomTeam provides software development, UI/UX design, digital marketing, and business strategy services. We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.",
  },
  {
    title: "Intellectual Property",
    content:
      "All deliverables, code, designs, and assets created by UnicomTeam for a client become the client's property upon full payment. UnicomTeam retains the right to showcase completed work in our portfolio unless a non-disclosure agreement is in place.",
  },
  {
    title: "Payment & Refunds",
    content:
      "Payment terms are defined per project contract. Deposits are non-refundable. Refunds for milestone-based projects are evaluated case by case. Disputes must be raised within 7 days of delivery.",
  },
  {
    title: "Confidentiality",
    content:
      "Both parties agree to keep confidential any proprietary information shared during the engagement. This obligation survives the termination of the agreement.",
  },
  {
    title: "Limitation of Liability",
    content:
      "UnicomTeam is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific service in question.",
  },
  {
    title: "Governing Law",
    content:
      "These terms are governed by applicable international commercial law. Any disputes shall be resolved through mutual negotiation before pursuing formal legal proceedings.",
  },
  {
    title: "Changes to Terms",
    content:
      "We may update these Terms of Service at any time. Continued use of our services after changes constitutes acceptance of the updated terms. We encourage you to review this page periodically.",
  },
];

export default function TermsPage() {
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
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: 0, maxWidth: "620px" }}>
            Please read these terms carefully before engaging with UnicomTeam.
            Last updated:{" "}
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
            Questions about these terms?{" "}
            <a href="/contact" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
              Contact us →
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
