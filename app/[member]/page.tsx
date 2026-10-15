import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { notFound } from "next/navigation";
import MemberWhatsAppForm from "@/components/MemberWhatsAppForm";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { contactFor, findTeamMember, teamMembers } from "@/lib/data/team";

type MemberProfilePageProps = {
  params: Promise<{ member: string }>;
};

const SITE_URL = "https://www.unicomteam.com";

/** The one green tick on the page: a scalloped seal with a white check, shown on the photo. */
function VerifiedSeal() {
  return (
    <svg className="verified-seal" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        className="verified-seal-shape"
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78 4 4 0 0 1 0-6.74Z"
      />
      <path className="verified-seal-check" d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function generateStaticParams() {
  return teamMembers.map(({ slug }) => ({ member: slug }));
}

export async function generateMetadata({ params }: MemberProfilePageProps): Promise<Metadata> {
  const { member: slug } = await params;
  const member = findTeamMember(slug);

  if (!member) return {};

  return {
    title: `${member.name} — ${member.role}`,
    description: member.summary,
    alternates: { canonical: `/${member.slug}` },
    openGraph: {
      title: `${member.name} — ${member.role} | UnicomTeam`,
      description: member.summary,
      url: `/${member.slug}`,
      type: "profile",
      images: [{ url: member.image, alt: `${member.name}, ${member.role}` }],
    },
  };
}

export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const { member: slug } = await params;
  const member = findTeamMember(slug);

  if (!member) notFound();

  const contact = contactFor(member);
  const otherMembers = teamMembers.filter((other) => other.slug !== member.slug);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.summary,
    image: `${SITE_URL}${member.image}`,
    url: `${SITE_URL}/${member.slug}`,
    email: contact.email,
    telephone: contact.phone,
    knowsAbout: member.focus,
    worksFor: { "@type": "Organization", name: "UnicomTeam", url: SITE_URL },
  };

  return (
    <main className="section-page member-page">
      <div className="member-aurora" aria-hidden="true" />

      <script
        type="application/ld+json"
        // "<" is escaped so the JSON can never close the script tag early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="member-wide member-profile">
        <Link href="/about" className="member-profile-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Meet the team
        </Link>

        {/* ── Three cards: photo · details · WhatsApp ───────────────────── */}
        <section className="member-top" aria-label={`${member.name}, ${member.role}`}>
          <article className="member-card member-photo-card">
            <span
              className="member-photo-tick"
              role="img"
              aria-label="Verified UnicomTeam member"
              title="Verified UnicomTeam member"
            >
              <VerifiedSeal />
            </span>
            <Image
              src={member.image}
              alt={`${member.name}, ${member.role}`}
              width={1024}
              height={1536}
              priority
              sizes="(min-width: 1180px) 30vw, (min-width: 760px) 40vw, 100vw"
              className="member-profile-image"
            />
          </article>

          <article className="member-card member-details-card">
            <span className="section-eyebrow">UnicomTeam member</span>
            <h1>{member.name}</h1>
            <p className="member-profile-role">{member.role}</p>
            <p className="member-slogan">{member.slogan}</p>
            <p className="member-profile-summary">{member.summary}</p>

            <ul className="member-contact-list" aria-label={`Contact details for ${member.name}`}>
              <li>
                <a href={contact.phoneHref}>
                  <span className="member-contact-icon" aria-hidden="true">
                    <Phone size={16} />
                  </span>
                  <span className="member-contact-text">
                    <small>{contact.sharedPhone ? "Phone · UnicomTeam line" : "Phone"}</small>
                    <span>{contact.phone}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`}>
                  <span className="member-contact-icon" aria-hidden="true">
                    <Mail size={16} />
                  </span>
                  <span className="member-contact-text">
                    <small>{contact.sharedEmail ? "Email · UnicomTeam" : "Email"}</small>
                    <span>{contact.email}</span>
                  </span>
                </a>
              </li>
              <li>
                <div>
                  <span className="member-contact-icon" aria-hidden="true">
                    <MapPin size={16} />
                  </span>
                  <span className="member-contact-text">
                    <small>Location</small>
                    <span>{contact.location}</span>
                  </span>
                </div>
              </li>
            </ul>

            <p className="member-verified-note">
              <ShieldCheck size={18} aria-hidden="true" />
              Verified UnicomTeam member. This is an official profile published by UnicomTeam.
            </p>
          </article>

          <article id="message" className="member-card member-form-card" aria-labelledby="member-message-title">
            <span className="member-message-icon" aria-hidden="true">
              <WhatsAppIcon size={24} />
            </span>
            <h2 id="member-message-title" className="member-form-title">
              Message {member.name} on WhatsApp
            </h2>
            <p className="member-form-intro">
              Write your first message and WhatsApp opens with it ready to send. Nothing is stored on our servers.
            </p>
            <MemberWhatsAppForm memberName={member.name} number={contact.whatsapp} />
          </article>
        </section>

        {/* ── About + role at the company ──────────────────────────────── */}
        <section className="member-section member-about" aria-labelledby="member-about-title">
          <div>
            <span className="member-profile-label">
              <Sparkles size={16} aria-hidden="true" />
              About
            </span>
            <h2 id="member-about-title" className="member-section-title">
              About {member.name}
            </h2>
            <div className="member-bio">
              {member.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="member-card member-card--accent">
            <span className="member-profile-label">
              <BriefcaseBusiness size={16} aria-hidden="true" />
              Role at UnicomTeam
            </span>
            <p className="member-card-lead">{member.companyRole}</p>
            <p>
              Working as part of a remote, multidisciplinary team that combines engineering, design, and growth
              strategy.
            </p>
            <Link href="/contact" className="member-profile-contact">
              Work with our team
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        </section>

        {/* ── What they do ─────────────────────────────────────────────── */}
        <section className="member-section" aria-labelledby="member-does-title">
          <span className="member-profile-label">
            <Target size={16} aria-hidden="true" />
            Responsibilities
          </span>
          <h2 id="member-does-title" className="member-section-title">
            What {member.name} does
          </h2>

          <ol className="member-steps">
            {member.responsibilities.map((item, index) => (
              <li key={item} className="member-card">
                <span className="member-step-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{item}</p>
              </li>
            ))}
          </ol>

          <ul className="member-focus-list" aria-label="Areas of focus">
            {member.focus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {/* ── Rest of the team ─────────────────────────────────────────── */}
        <section className="member-section" aria-labelledby="member-team-title">
          <span className="member-profile-label">Team</span>
          <h2 id="member-team-title" className="member-section-title">
            Meet the rest of the team
          </h2>

          <ul className="member-team-grid">
            {otherMembers.map((other) => (
              <li key={other.slug}>
                <Link href={`/${other.slug}`} className="member-team-card">
                  <span className="member-team-photo">
                    <Image
                      src={other.image}
                      alt=""
                      width={400}
                      height={500}
                      sizes="(min-width: 900px) 22vw, 46vw"
                      className="member-team-img"
                    />
                  </span>
                  <span className="member-team-name">{other.name}</span>
                  <span className="member-team-role">{other.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
