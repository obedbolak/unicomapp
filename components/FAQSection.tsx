"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const faqs = [
  {
    question: "What services does UnicomTeam offer?",
    answer:
      "We offer end-to-end digital services including software development, UI/UX design, mobile & web development, digital marketing, social media management, and business strategy consulting. Think of us as your all-in-one distributed product team.",
  },
  {
    question: "How does the training program work?",
    answer:
      "Our training programs are mentor-led and structured into phases. You pick a duration — 3 months, 6 months, or 1 year — and go through a curated curriculum with live sessions, real projects, and 1-on-1 mentorship. You graduate with a portfolio and a certificate.",
  },
  {
    question: "Are the training programs remote?",
    answer:
      "Yes, all programs are fully remote. We operate as a cloud-first team, so sessions happen online via video calls, collaborative tools, and async communication. You can join from anywhere in the world.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "It depends on scope. A simple landing page or MVP can take 2–4 weeks. A full-scale web app or e-commerce platform typically takes 6–12 weeks. We provide a detailed timeline after scoping your requirements.",
  },
  {
    question: "Do you offer post-launch support?",
    answer:
      "Yes. We offer maintenance packages and ongoing support after project delivery. Whether it's bug fixes, feature additions, or performance monitoring — we stay available for your product's growth.",
  },
  {
    question: "What is the payment structure for projects?",
    answer:
      "We typically work on a milestone-based payment structure — an upfront deposit to begin, then payments tied to delivery milestones. Full terms are outlined in the project contract before work starts.",
  },
  {
    question: "Can I switch training plans mid-program?",
    answer:
      "Yes, you can upgrade your plan at any time. If you started on the 3-month Starter plan and want to extend to 6 months or 1 year, just reach out and we'll adjust your curriculum and pricing accordingly.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply head to our Contact page, fill out the form with a brief description of what you need, and our team will get back to you within 24 hours to schedule a discovery call.",
  },
];

export default function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        paddingTop: "5rem",
        paddingBottom: "5rem",
        paddingLeft: "clamp(1rem, 5vw, 4rem)",
        paddingRight: "clamp(1rem, 5vw, 4rem)",
      }}
    >
      <style>{`
        .faq-item {
          border-radius: 0.875rem;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          transition: border-color 0.25s, background 0.25s;
          overflow: hidden;
        }
        .faq-item[open] {
          border-color: rgba(255,140,0,0.25);
          background: rgba(255,140,0,0.03);
        }
        .faq-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.65rem 1rem;
          margin: 1.25rem 1.5rem;
          cursor: pointer;
          list-style: none;
          user-select: none;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          font-family: var(--font-display);
          font-size: 0.8125rem;
          font-weight: 600;
          transition: background 0.2s;
          position: relative;
          z-index: 1;
        }
        .faq-item[open] .faq-summary {
          background: rgba(255,140,0,0.08);
          border-color: rgba(255,140,0,0.25);
          color: var(--color-text);
        }
        .faq-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.06);
          color: var(--color-text-muted);
          font-size: 1.1rem;
          line-height: 1;
          transition: background 0.2s, color 0.2s, transform 0.25s;
        }
        .faq-item[open] .faq-icon {
          background: var(--color-primary);
          color: #000;
          transform: rotate(45deg);
        }
        .faq-answer {
          padding: 0 1.5rem 1.25rem;
          font-family: var(--font-display);
          font-size: 0.875rem;
          color: var(--color-text-muted);
          line-height: 1.7;
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center", marginBottom: "3rem" }}
      >
        <span className="section-eyebrow">FAQ</span>
        <h2
          className="section-heading"
          style={{ color: "var(--color-text)", fontSize: "2rem", marginBottom: "0.75rem" }}
        >
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <p
          style={{
            fontFamily: "var(--font-display)", fontSize: "0.9375rem",
            color: "var(--color-text-muted)", maxWidth: "520px",
            margin: "0 auto", lineHeight: 1.6,
          }}
        >
          Everything you need to know about UnicomTeam, our services, and how we work.
        </p>
      </motion.div>

      {/* FAQ grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "0.75rem",
          alignItems: "start",
        }}
      >
        {faqs.map((faq) => (
          <details key={faq.question} className="faq-item" name="faq">
            <summary className="faq-summary">
              <span>{faq.question}</span>
              <span className="faq-icon">+</span>
            </summary>
            <p className="faq-answer">{faq.answer}</p>
          </details>
        ))}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ textAlign: "center", marginTop: "2.5rem" }}
      >
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
          Still have questions?
        </p>
        <a
          href="/contact"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.65rem 1.25rem", borderRadius: "0.75rem",
            background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.25)",
            color: "var(--color-primary)", fontFamily: "var(--font-display)",
            fontSize: "0.875rem", fontWeight: 700, textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,140,0,0.18)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,140,0,0.1)")}
        >
          Contact us →
        </a>
      </motion.div>
    </section>
  );
}
