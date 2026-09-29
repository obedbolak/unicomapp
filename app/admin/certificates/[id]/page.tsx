// app/admin/certificates/[id]/page.tsx
//
// Edit an issued certificate — for fixing a misspelt name, a wrong date or a
// programme title. The number and type stay fixed: the number is printed on
// the certificate and in its QR code, so copies already sent keep verifying,
// and the type is part of the number (UCT-INT-… is always an internship).

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import SubmitButton from "@/components/ui/SubmitButton";
import { updateCertificate } from "../../certificate-actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  INTERNSHIP: "Internship",
  TRAINING: "Training",
  CRASH_COURSE: "Crash course",
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export default async function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.certificate.findUnique({
    where: { id },
    include: { file: { select: { createdAt: true } } },
  });
  if (!c) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${c.certNo}`}
        subtitle="Changes show on the certificate PDF and on its verify page straight away. The number and QR code stay the same, so copies already sent still verify."
        action={
          <Link href="/admin/certificates" className="dash-btn">
            ← All certificates
          </Link>
        }
      />

      <Card
        title={c.name}
        subtitle={`${TYPE_LABEL[c.type] ?? c.type} certificate`}
        action={<Badge value={c.status} />}
      >
        <form action={updateCertificate} className="dash-formgrid">
          <input type="hidden" name="id" value={c.id} />
          {/* Used by Preview so the draft shows this certificate's number. */}
          <input type="hidden" name="certNo" value={c.certNo} />
          <input type="hidden" name="type" value={c.type} />

          <label>
            <span className="dash-field-label">Holder name</span>
            <input
              name="name"
              required
              defaultValue={c.name}
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Programme</span>
            <input
              name="program"
              required
              defaultValue={c.program}
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Department</span>
            <input
              name="department"
              required
              defaultValue={c.department}
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Period start</span>
            <input
              name="periodStart"
              type="date"
              required
              defaultValue={ymd(c.periodStart)}
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Period end</span>
            <input
              name="periodEnd"
              type="date"
              required
              defaultValue={ymd(c.periodEnd)}
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Date issued</span>
            <input
              name="dateIssued"
              type="date"
              required
              defaultValue={ymd(c.dateIssued)}
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Supervisor</span>
            <input
              name="supervisorName"
              required
              defaultValue={c.supervisorName}
              className="dash-input"
            />
          </label>

          <label>
            <span className="dash-field-label">Supervisor title</span>
            <input
              name="supervisorTitle"
              required
              defaultValue={c.supervisorTitle}
              className="dash-input"
            />
          </label>

          <div
            style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end" }}
          >
            <button
              type="submit"
              formAction="/api/certificates/preview"
              formMethod="post"
              formEncType="multipart/form-data"
              formTarget="_blank"
              className="dash-btn"
            >
              Preview
            </button>
            <SubmitButton
              className="dash-btn dash-btn--primary"
              pendingText="Saving…"
            >
              Save changes
            </SubmitButton>
          </div>
        </form>

        <p
          className="dash-td-muted"
          style={{ fontSize: "0.75rem", margin: "1.25rem 0 0" }}
        >
          {c.file ? (
            <>
              Saved copy of the PDF as issued
              {" (last saved "}
              {c.file.createdAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {"): "}
              <a
                href={`/api/certificates/${c.id}/saved`}
                style={{ color: "var(--color-primary)", fontWeight: 700 }}
              >
                download
              </a>
              . Saving changes stores a new copy; earlier ones are kept.
            </>
          ) : (
            "No saved copy yet — one is stored when you save changes (needs file storage set up)."
          )}
        </p>
      </Card>
    </>
  );
}
