import Link from "next/link";
import { notFound } from "next/navigation";
import { findServiceBySlug } from "../data";

interface ServicePageProps {
  params: {
    service: string;
  };
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  const service = findServiceBySlug(params.service);

  if (!service) {
    notFound();
  }

  return (
    <div className="section-page">
      <div className="container-7xl">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center text-sm font-semibold text-primary transition hover:text-primary/80"
        >
          ← Back to services
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div>
            <span className="section-eyebrow">{service.tag}</span>
            <h1 className="section-heading" style={{ color: "var(--color-text)" }}>
              {service.title}
            </h1>
            <p className="hero-subtitle" style={{ marginBottom: "1.75rem" }}>
              {service.desc}
            </p>
            <div className="space-y-4 text-sm leading-relaxed text-muted">
              {service.details.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          </div>

          <div className="card border border-border bg-surface p-8 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">What you get</h2>
            <ul className="space-y-3 text-sm leading-relaxed text-muted">
              {service.details.map((detail) => (
                <li key={detail} className="list-disc pl-4">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
