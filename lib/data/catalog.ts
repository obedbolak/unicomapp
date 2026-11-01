// lib/data/catalog.ts
//
// Server-side reader for the course catalogue. Reads published Programs from
// the database; if the database is unreachable or has not been seeded yet it
// falls back to the static catalogue so the pages keep working.
//
// Server components only — do not import this from a "use client" file.

import type { Program as Row } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  allCourses,
  type Course,
  type CourseKind,
  type CourseSection,
  type CourseVariant,
  type DeliveryMode,
} from "@/lib/data/trainings";

const KIND: Record<string, CourseKind> = {
  TRAINING: "TRAINING",
  CRASH_COURSE: "CRASH_COURSE",
  ONLINE_COURSE: "ONLINE_COURSE",
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  CRASH_COURSE: "Crash Course",
};

function toCourse(r: Row): Course | null {
  const kind = KIND[r.kind];
  if (!kind) return null; // internships are handled separately

  const variants = Array.isArray(r.variants)
    ? (r.variants as unknown as CourseVariant[])
    : [];
  if (variants.length === 0) return null;

  const modes = (r.deliveryModes ?? []) as DeliveryMode[];

  return {
    slug: r.slug,
    kind,
    modes: modes.length
      ? modes
      : kind === "ONLINE_COURSE"
        ? ["SELF_PACED"]
        : ["PHYSICAL", "LIVE_ONLINE"],
    badge:
      kind === "ONLINE_COURSE"
        ? "Online Course"
        : (LEVEL_LABEL[r.level ?? ""] ?? "Course"),
    badgeColor: r.badgeColor ?? "rgba(255,140,0,0.15)",
    badgeBorder: r.badgeBorder ?? "rgba(255,140,0,0.3)",
    badgeText: r.badgeText ?? "#ff8c00",
    title: r.title,
    subtitle: r.subtitle ?? "",
    description: r.description,
    category: r.category ?? "General",
    icon: r.icon ?? "🎓",
    accent: r.accent ?? "rgba(255,140,0,0.08)",
    accentBorder: r.accentBorder ?? "rgba(255,140,0,0.2)",
    featured: r.featured,
    topics: r.topics.length ? r.topics : null,
    variants,
    curriculum: Array.isArray(r.curriculum)
      ? (r.curriculum as unknown as CourseSection[])
      : undefined,
    instructor: r.instructor ?? undefined,
  };
}

/** All published courses (professional, online, crash), in display order. */
export async function getCourses(): Promise<Course[]> {
  try {
    const rows = await prisma.program.findMany({
      where: {
        published: true,
        kind: { in: ["TRAINING", "ONLINE_COURSE", "CRASH_COURSE"] },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    const courses = rows.map(toCourse).filter((c): c is Course => c !== null);
    if (courses.length > 0) return courses;
  } catch (err) {
    console.error("Catalogue DB read failed, using static data:", err);
  }
  return allCourses;
}

export async function getCourse(slug: string): Promise<Course | null> {
  const all = await getCourses();
  return all.find((c) => c.slug === slug) ?? null;
}
