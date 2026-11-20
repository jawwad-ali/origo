import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/features/shell/components/app-header";
import { AppSidebar } from "@/features/shell/components/app-sidebar";
import { getCurrentUser } from "@/lib/session/get-current-user";

const SIDEBAR_COOKIE = "sidebar_state";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, cookieStore] = await Promise.all([getCurrentUser(), cookies()]);
  const sidebarOpen = cookieStore.get(SIDEBAR_COOKIE)?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader user={user} />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
