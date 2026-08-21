import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  Badge,
  Card,
  PageHeader,
  StatGrid,
  StatTile,
  Table,
  shortDate,
} from "@/components/dashboard/ui";
import {
  IconBriefcase,
  IconCheck,
  IconTrend,
} from "@/components/dashboard/icons";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/projects");

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { leadId: user.id },
        { assignments: { some: { userId: user.id } } },
      ],
      status: { notIn: ["CANCELLED"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { name: true } },
      lead: { select: { name: true } },
      assignments: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      milestones: {
        where: { completedAt: null },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
      _count: { select: { tasks: true } },
    },
  });

  const totalTasks = await prisma.task.count({
    where: { assigneeId: user.id },
  });

  const completedTasks = await prisma.task.count({
    where: { assigneeId: user.id, status: "DONE" },
  });
  
  const openTasksCount = totalTasks - completedTasks;
  const activeProjectsCount = projects.filter((p) => p.status === "IN_PROGRESS").length;

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="All projects you're assigned to."
      />

      <StatGrid>
        <StatTile
          label="Total Projects"
          value={projects.length}
          icon={<IconBriefcase size={20} />}
        />
        <StatTile
          label="Active Projects"
          value={activeProjectsCount}
          icon={<IconTrend size={20} />}
        />
        <StatTile
          label="Open Tasks"
          value={openTasksCount}
          hint={`${completedTasks} completed`}
          icon={<IconCheck size={20} />}
        />
      </StatGrid>

      <Card flush>
        <Table
          headers={[
            "Project",
            "Client",
            "Lead",
            "Status",
            "Tasks",
            "Next Milestone",
            "Updated",
          ]}
          empty="You're not assigned to any projects right now."
        >
          {projects.map((p) => (
            <tr key={p.id}>
              <td style={{ fontWeight: 600 }}>{p.title}</td>
              <td className="dash-td-muted">{p.client?.name ?? "Internal"}</td>
              <td className="dash-td-muted">{p.lead?.name ?? "—"}</td>
              <td>
                <Badge value={p.status} />
              </td>
              <td className="dash-td-muted">{p._count.tasks}</td>
              <td className="dash-td-muted">
                {p.milestones[0]
                  ? `${p.milestones[0].title} (${shortDate(p.milestones[0].dueDate)})`
                  : "—"}
              </td>
              <td className="dash-td-muted">{shortDate(p.updatedAt)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
