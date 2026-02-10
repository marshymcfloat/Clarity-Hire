import { requirePlatformAdmin } from "@/lib/server-auth";
import { prisma } from "@/prisma/prisma";
import { redirect } from "next/navigation";

export default async function AdminAuditPage() {
  const auth = await requirePlatformAdmin();
  if (!auth.authorized) {
    redirect("/");
  }

  const logs = await prisma.adminAuditLog.findMany({
    include: {
      Actor: {
        select: {
          email: true,
          name: true,
        },
      },
      Company: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <section className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin: Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Immutable log of platform moderation actions.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Actor</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Target</th>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-3">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {log.Actor.name || log.Actor.email}
                </td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">
                  {log.targetType}:{log.targetId}
                </td>
                <td className="px-4 py-3">
                  {log.Company ? `${log.Company.name} (${log.Company.slug})` : "-"}
                </td>
                <td className="px-4 py-3">{log.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
