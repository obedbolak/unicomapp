import { getCourses } from "@/lib/data/catalog";
import TrainingsView from "./TrainingsView";

// Read from the database on each request so new courses appear without a deploy.
export const dynamic = "force-dynamic";

export default async function TrainingsPage() {
  const courses = await getCourses();
  return <TrainingsView courses={courses} />;
}
