import { ORG_TYPE_LABELS, type CurrentUserDto } from "@origo/shared";
import { OrgStatusBadge } from "@/components/status/org-status-badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader = ({ user }: { user: CurrentUserDto }) => {
  const org = user.membership?.organization;

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      {org ? (
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{org.name}</span>
          <span className="text-muted-foreground hidden text-sm sm:inline">
            · {ORG_TYPE_LABELS[org.type]}
          </span>
          {org.status !== "APPROVED" ? <OrgStatusBadge status={org.status} /> : null}
        </div>
      ) : (
        <span className="text-sm font-medium">Origo platform</span>
      )}
    </header>
  );
};
