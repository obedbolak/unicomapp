"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { programs, crashCourses } from "@/lib/data/trainings";


export default function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
  // Find course in either programs or crash courses
  const course = [...programs, ...crashCourses].find(c => c.slug === slug);

  if (!course) {
    return notFound();
  }

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const selectedVariant = course.variants[selectedVariantIndex];

  const handleEnroll = () => {
    const query = new URLSearchParams({
      course: course.title,
      category: course.category,
      price: selectedVariant.price,
      duration: selectedVariant.duration,
    });
    router.push(`/trainings/enroll?${query.toString()}`);
  };

  return (
    <main style={{ minHeight: "100vh", paddingTop: "calc(var(--header-height-mobile) + 3rem)", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: "var(--container-3xl)", margin: "0 auto", padding: "0 1.5rem" }}>
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-display)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "2rem",
            padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Trainings
        </button>

        {/* Hero Section */}
        <div style={{ marginBottom: "3rem" }}>
          <span
            style={{
              display: "inline-block",
              padding: "0.4rem 0.8rem",
              borderRadius: "999px",
              background: course.badgeColor,
              border: `1px solid ${course.badgeBorder}`,
              color: course.badgeText,
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1rem",
            }}
          >
            {course.badge}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 800,
              color: "var(--color-text)",
              marginBottom: "0.5rem",
              lineHeight: 1.1,
            }}
          >
            {course.title}
          </h1>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              fontWeight: 600,
              color: "var(--color-primary)",
              marginBottom: "1.5rem",
            }}
          >
            {course.subtitle}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.125rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              maxWidth: "800px",
            }}
          >
            {course.description}
          </p>
        </div>

        {/* Dynamic Variant Selector Section */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "1.5rem",
            padding: "2rem",
            display: "grid",
            gap: "2.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {/* Left Column: Selector */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-text)",
                marginBottom: "1rem",
              }}
            >
              Choose your duration
            </h3>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              Select a duration to see specific curriculum details, session counts, and pricing.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {course.variants.map((variant, index) => (
                <button
                  key={variant.duration}
                  onClick={() => setSelectedVariantIndex(index)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "1rem 1.25rem",
                    borderRadius: "1rem",
                    background: selectedVariantIndex === index ? course.accent : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedVariantIndex === index ? course.accentBorder : "var(--color-border)"}`,
                    color: "var(--color-text)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: `2px solid ${selectedVariantIndex === index ? course.badgeText : "var(--color-text-muted)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selectedVariantIndex === index && (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: course.badgeText }} />
                      )}
                    </div>
                    <span>{variant.duration} Track</span>
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{variant.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Details & Checkout */}
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: "1rem",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: course.badgeText, marginBottom: "0.5rem" }}>
                {selectedVariant.price}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                For the {selectedVariant.duration} {course.category} program
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flexGrow: 1, marginBottom: "2rem" }}>
              {[
                { icon: "📡", label: "Live Classes", value: selectedVariant.sessions },
                { icon: "👤", label: "Mentorship", value: selectedVariant.mentorship },
                { icon: "🏆", label: "Outcome", value: selectedVariant.outcome },
              ].map((detail) => (
                <div key={detail.label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                    {detail.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                      {detail.label}
                    </div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text)" }}>
                      {detail.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleEnroll}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "0.75rem",
                background: "var(--color-primary)",
                border: "none",
                color: "#000",
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
              Enroll Now →
            </button>
          </div>
        </div>

        {/* Topics Section (If available) */}
        {course.topics && (
          <div style={{ marginTop: "4rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              What you will learn
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {course.topics.map(topic => (
                <span
                  key={topic}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.875rem",
                    color: "var(--color-text)",
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
