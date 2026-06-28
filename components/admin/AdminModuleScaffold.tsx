import { FUTURE_FEATURES } from "@/lib/future-features";
import { getModuleMeta } from "@/lib/admin/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Construction, Rocket } from "lucide-react";
import Link from "next/link";

interface AdminModuleScaffoldProps {
  moduleId: string;
}

export function AdminModuleScaffold({ moduleId }: AdminModuleScaffoldProps) {
  const meta = getModuleMeta(moduleId);
  const relatedFuture = FUTURE_FEATURES.filter(
    (f) => f.route?.includes(moduleId) || f.apiNamespace?.includes(moduleId)
  );

  if (!meta) {
    return (
      <>
        <AdminHeader title="Module not found" />
        <div className="p-8 text-center text-text-grey">
          <p>This admin section does not exist.</p>
          <Link href="/admin" className="mt-4 inline-block text-green-dark hover:underline">
            Back to dashboard
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={meta.title} subtitle={meta.description} />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="admin-card flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-dark/10 text-green-dark">
            <Construction className="h-7 w-7" aria-hidden />
          </span>
          <h2 className="mt-4 font-primary text-xl font-semibold text-text-dark">
            {meta.title} module
          </h2>
          <p className="mt-2 max-w-lg text-sm text-text-grey">{meta.description}</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-green-dark">
            Scaffold ready · Full CRUD coming next
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="admin-card p-5">
            <h3 className="font-medium text-text-dark">Planned capabilities</h3>
            <ul className="mt-4 space-y-2">
              {meta.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 rounded-xl bg-[var(--admin-bg)] px-3 py-2 text-sm text-text-dark"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-bright" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {relatedFuture.length > 0 && (
            <div className="admin-card p-5">
              <h3 className="flex items-center gap-2 font-medium text-text-dark">
                <Rocket className="h-4 w-4 text-green-dark" aria-hidden />
                Related roadmap
              </h3>
              <ul className="mt-4 space-y-2">
                {relatedFuture.map((f) => (
                  <li key={f.id} className="rounded-xl border border-[var(--admin-border)] px-3 py-2 text-sm">
                    <span className="font-medium">{f.name}</span>
                    <span className="ml-2 text-xs capitalize text-text-grey">({f.status})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
