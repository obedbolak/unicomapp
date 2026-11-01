import { notFound } from "next/navigation";
import { getCourse } from "@/lib/data/catalog";
import CourseDetails from "./CourseDetails";

export const dynamic = "force-dynamic";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  return <CourseDetails course={course} />;
}
