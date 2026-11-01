import { getCourses } from "@/lib/data/catalog";
import EnrollForm, { type CatalogEntry } from "./EnrollForm";

export const dynamic = "force-dynamic";

export default async function EnrollPage() {
  const courses = await getCourses();
  const catalog: CatalogEntry[] = courses.map((c) => ({
    title: c.title,
    kind: c.kind,
    modes: c.modes,
    price: c.variants[0]?.price ?? "",
  }));
  return <EnrollForm catalog={catalog} />;
}
