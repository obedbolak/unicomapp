import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { findTeamMember, teamMembers } from "@/lib/data/team";

type MemberProfilePageProps = {
  params: Promise<{ member: string }>;
};

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
  };
}

export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const { member: slug } = await params;
  const member = findTeamMember(slug);

  if (!member) notFound();

  return (
    <main className="section-page">
      <div className="container-4xl member-profile">
        <Link href="/about" className="member-profile-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Meet the team
        </Link>

        <section className="member-profile-hero">
          <div className="member-profile-image-wrap">
            <Image
              src={member.image}
              alt={`${member.name}, ${member.role}`}
              width={1024}
              height={1536}
              priority
              className="member-profile-image"
            />
          </div>

          <div className="member-profile-copy">
            <span className="section-eyebrow">UnicomTeam member</span>
            <h1>{member.name}</h1>
            <p className="member-profile-role">{member.role}</p>
            <p className="member-profile-summary">{member.summary}</p>
            <Link href="/contact" className="member-profile-contact">
              Work with our team
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="member-profile-details" aria-label={`${member.name}'s areas of focus`}>
          <div>
            <span className="member-profile-label">
              <BriefcaseBusiness size={16} aria-hidden="true" />
              Role at UnicomTeam
            </span>
            <p>
              Working as part of a remote, multidisciplinary team that combines engineering, design, and growth strategy.
            </p>
          </div>
          <div>
            <span className="member-profile-label">
              <Sparkles size={16} aria-hidden="true" />
              Areas of focus
            </span>
            <ul>
              {member.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
