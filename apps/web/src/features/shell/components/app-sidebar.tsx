"use client";

import { type CurrentUserDto } from "@origo/shared";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrigoMark } from "@/components/brand/origo-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/routes";
import { buildNav, isActivePath } from "../nav";
import { UserMenu } from "./user-menu";

export const AppSidebar = ({ user }: { user: CurrentUserDto }) => {
  const pathname = usePathname();
  const sections = buildNav(user);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-4 group-data-[collapsible=icon]:px-2">
        <Link
          href={ROUTES.dashboard}
          aria-label="Origo home"
          className="focus-visible:ring-ring rounded-md outline-none focus-visible:ring-2"
        >
          <OrigoMark className="group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link href={item.href} aria-current={active ? "page" : undefined}>
                          <item.icon aria-hidden="true" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
