"use client";

import { useEffect, useRef, useState } from "react";

export default function ComingSoonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  // State for the 3-day countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    // Set target date to exactly 3 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Animated UnicomTeam Wave/Node Grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      const COLS = 20;
      const ROWS = 12;
      const cw = W / COLS;
      const rh = H / ROWS;

      for (let col = 0; col <= COLS; col++) {
        for (let row = 0; row <= ROWS; row++) {
          const wave = Math.sin(t * 0.6 + col * 0.3 + row * 0.2) * 0.5 + 0.5;
          const lineAlpha = wave * 0.12 + 0.03;
          ctx.strokeStyle = `rgba(0, 82, 204, ${lineAlpha})`;
          ctx.lineWidth = 0.75;

          if (col === 0 && row < ROWS) {
            ctx.beginPath();
            ctx.moveTo(0, row * rh);
            ctx.lineTo(W, row * rh);
            ctx.stroke();
          }
          if (row === 0 && col < COLS) {
            ctx.beginPath();
            ctx.moveTo(col * cw, 0);
            ctx.lineTo(col * cw, H);
            ctx.stroke();
          }

          if ((col + row) % 3 === 0) {
            const dotAlpha = wave * 0.4 + 0.05;
            const isOrange = col % 2 === 0;
            ctx.fillStyle = isOrange
              ? `rgba(255, 69, 0, ${dotAlpha})`
              : `rgba(255, 165, 0, ${dotAlpha})`;

            ctx.beginPath();
            ctx.arc(col * cw, row * rh, wave * 1.8 + 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      const scanY = ((t * 35) % (H + 120)) - 60;
      const scanGrad = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 80);
      scanGrad.addColorStop(0, "rgba(0, 82, 204, 0)");
      scanGrad.addColorStop(0.5, "rgba(0, 82, 204, 0.04)");
      scanGrad.addColorStop(1, "rgba(0, 82, 204, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 80, W, 160);

      t += 0.016;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const pad = (num: number) => String(num).padStart(2, "0");

  return (
    <main
      style={{
        height: "100vh",
        maxHeight: "100vh",
        background:
          "radial-gradient(circle at 80% 20%, #001f54 0%, #000814 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Poppins', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .brand-tag { 
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(0, 102, 255, 0.3);
          background: rgba(0, 40, 102, 0.2);
          color: #3385ff;
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          padding: 6px 14px; text-transform: uppercase;
          border-radius: 4px;
        }

        .headline {
          font-size: clamp(38px, 6.5vw, 76px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin: 0;
        }
        
        .headline .accent-orange {
          background: linear-gradient(135deg, #FF8C00 0%, #FF3B00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
        }

        .countdown-container {
          display: flex;
          gap: 24px;
          margin-bottom: 40px;
        }
        .countdown-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .countdown-num {
          font-size: clamp(32px, 5vw, 54px);
          font-weight: 700;
          line-height: 1;
          color: #ffffff;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .countdown-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 4px;
        }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #FFB300 0%, #FF8C00 100%);
          color: #000814;
          font-size: 14px; font-weight: 700;
          padding: 14px 32px; border-radius: 6px;
          border: none; cursor: pointer; transition: all 0.2s ease;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(255, 140, 0, 0.25);
        }
        .cta-btn:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 140, 0, 0.4);
        }

        .ghost-btn {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.15); 
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px; font-weight: 600;
          padding: 13px 28px; background: rgba(255, 255, 255, 0.03);
          border-radius: 6px; cursor: pointer; text-decoration: none; 
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }
        .ghost-btn:hover { 
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .ticker-wrap {
          width: 100%; overflow: hidden;
          border-top: 1px solid rgba(0, 82, 204, 0.15); 
          border-bottom: 1px solid rgba(0, 82, 204, 0.15);
          padding: 12px 0; background: rgba(0, 8, 20, 0.7); backdrop-filter: blur(8px);
        }
        .ticker-inner { display: flex; gap: 0; animation: marquee 26s linear infinite; white-space: nowrap; }
        .ticker-item {
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4); padding: 0 28px;
          font-weight: 500;
        }
        .ticker-item .sep { color: #FF4500; margin: 0 12px; }
      `}</style>

      {/* Canvas Elements */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(255,59,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "25%",
          right: "5%",
          width: "700px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(0,102,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top Banner Ticker */}
      <div className="ticker-wrap" style={{ position: "relative", zIndex: 1 }}>
        <div className="ticker-inner">
          {Array(2)
            .fill(null)
            .map((_, i) => (
              <span key={i} style={{ display: "flex" }}>
                {[
                  "Software Solutions",
                  "Digital Marketing",
                  "Mobile & Web Development",
                  "Social Media Management",
                  "Business Strategy",
                ].map((item) => (
                  <span key={item} className="ticker-item">
                    {item} <span className="sep">★</span>
                  </span>
                ))}
              </span>
            ))}
        </div>
      </div>

      {/* Content Main Body Layout */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 60px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(12px)",
            transition: "opacity 0.5s 0.1s, transform 0.5s 0.1s",
            marginBottom: "24px",
          }}
        >
          <span className="brand-tag">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#FF3B00",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            UnicomTeam • Platform Launching
          </span>
        </div>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(24px)",
            transition: "opacity 0.6s 0.2s, transform 0.6s 0.2s",
            marginBottom: "20px",
          }}
        >
          <h1 className="headline">
            Digital Solutions.
            <span className="accent-orange">Empowering Business.</span>
          </h1>
        </div>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(16px)",
            transition: "opacity 0.6s 0.3s, transform 0.6s 0.3s",
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              color: "rgba(255, 255, 255, 0.6)",
              maxWidth: "560px",
              lineHeight: "1.6",
            }}
          >
            We are shaping a next-generation ecosystem for our upcoming
            deployment. Next-tier software engineering designed explicitly for
            commercial scale.
          </p>
        </div>

        {/* 3 Days Live Countdown Container */}
        <div
          className="countdown-container"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(16px)",
            transition: "opacity 0.6s 0.4s, transform 0.6s 0.4s",
          }}
        >
          <div className="countdown-box">
            <span className="countdown-num">{pad(timeLeft.days)}</span>
            <span className="countdown-label">Days</span>
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "rgba(255,255,255,0.2)",
              alignSelf: "flex-start",
              lineHeight: "1.1",
            }}
          >
            :
          </div>
          <div className="countdown-box">
            <span className="countdown-num">{pad(timeLeft.hours)}</span>
            <span className="countdown-label">Hours</span>
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "rgba(255,255,255,0.2)",
              alignSelf: "flex-start",
              lineHeight: "1.1",
            }}
          >
            :
          </div>
          <div className="countdown-box">
            <span className="countdown-num">{pad(timeLeft.minutes)}</span>
            <span className="countdown-label">Mins</span>
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "rgba(255,255,255,0.2)",
              alignSelf: "flex-start",
              lineHeight: "1.1",
            }}
          >
            :
          </div>
          <div className="countdown-box">
            <span className="countdown-num">{pad(timeLeft.seconds)}</span>
            <span className="countdown-label">Secs</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(12px)",
            transition: "opacity 0.6s 0.5s, transform 0.6s 0.5s",
          }}
        >
          {/* Linked to your official Instagram link from ChatGPT Image May 29, 2026, 12_29_08 PM.png mapping */}
          <a
            href="https://www.instagram.com/unicomteam1?utm_source=qr&igsh=NGw4ZDhucHB5dXM5"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
          >
            <span>Get in touch</span>
          </a>
          <a href="#" className="ghost-btn">
            <span>Our Services</span>
          </a>
        </div>
      </div>

      {/* Footer Content containing explicit live links */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "28px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.35)" }}>
          © 2026 UnicomTeam. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: "24px" }}>
          <a
            href="https://www.facebook.com/share/18keP13dmW"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.4)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#FF8C00")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(255, 255, 255, 0.4)")
            }
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/unicomteam1?utm_source=qr&igsh=NGw4ZDhucHB5dXM5"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.4)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#FF8C00")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(255, 255, 255, 0.4)")
            }
          >
            Instagram
          </a>
          <a
            href="https://tiktok.com/@unicomteam0"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.4)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#FF8C00")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color =
                "rgba(255, 255, 255, 0.4)")
            }
          >
            TikTok
          </a>
        </div>
      </div>
    </main>
  );
}
