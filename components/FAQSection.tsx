"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

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

// ✅ Now receives openIndex and onToggle from parent
function FAQItem({
  faq,
  index,
  openIndex,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  index: number;
  openIndex: number | null;
  onToggle: (index: number) => void;
}) {
  const open = openIndex === index; // ✅ open is derived, not local state

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        borderRadius: "0.875rem",
        border: `1px solid ${open ? "rgba(255,140,0,0.25)" : "var(--color-border)"}`,
        background: open ? "rgba(255,140,0,0.03)" : "var(--color-surface)",
        overflow: "hidden",
        transition: "border-color 0.25s, background 0.25s",
      }}
    >
      {/* Question row */}
      <button
        onClick={() => onToggle(index)} // ✅ notify parent
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.65rem 1rem",
          margin: "1.25rem 1.5rem",
          width: "calc(100% - 3rem)",
          cursor: "pointer",
          borderRadius: "0.75rem",
          background: open ? "rgba(255,140,0,0.08)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(255,140,0,0.25)" : "var(--color-border)"}`,
          color: open ? "var(--color-text)" : "var(--color-text-muted)",
          fontFamily: "var(--font-display)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          textAlign: "left",
          transition: "background 0.2s, border-color 0.2s, color 0.2s",
        }}
      >
        <span>{faq.question}</span>
        <span
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: open
              ? "var(--color-primary)"
              : "rgba(255,255,255,0.06)",
            color: open ? "#000" : "var(--color-text-muted)",
            fontSize: "1.1rem",
            lineHeight: 1,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "background 0.2s, color 0.2s, transform 0.25s",
          }}
        >
          +
        </span>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                padding: "0 1.5rem 1.25rem",
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  // ✅ Single source of truth — only one item open at a time
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // ✅ Clicking the same item again closes it (toggle), clicking another opens it
  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const leftCol = faqs.filter((_, i) => i % 2 === 0);
  const rightCol = faqs.filter((_, i) => i % 2 !== 0);

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
          style={{
            color: "var(--color-text)",
            fontSize: "2rem",
            marginBottom: "0.75rem",
          }}
        >
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.9375rem",
            color: "var(--color-text-muted)",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Everything you need to know about UnicomTeam, our services, and how we
          work.
        </p>
      </motion.div>

      {/* Two columns */}
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "0.75rem",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {leftCol.map((faq, i) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={i * 2} // ✅ pass the real global index
              openIndex={openIndex}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Right column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {rightCol.map((faq, i) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={i * 2 + 1} // ✅ pass the real global index
              openIndex={openIndex}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ textAlign: "center", marginTop: "2.5rem" }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            marginBottom: "0.75rem",
          }}
        >
          Still have questions?
        </p>
        <a
          href="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "0.75rem",
            background: "rgba(255,140,0,0.1)",
            border: "1px solid rgba(255,140,0,0.25)",
            color: "var(--color-primary)",
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background =
              "rgba(255,140,0,0.18)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background =
              "rgba(255,140,0,0.1)")
          }
        >
          Contact us →
        </a>
      </motion.div>
    </section>
  );
}
