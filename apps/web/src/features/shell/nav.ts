import { type CurrentUserDto } from "@origo/shared";
import { Building2, LayoutDashboard, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const OVERVIEW: NavItem = { title: "Overview", href: ROUTES.dashboard, icon: LayoutDashboard };
const ADMIN_ORGS: NavItem = { title: "Organizations", href: ROUTES.adminOrganizations, icon: Building2 };

/** Navigation for this user. Only routes that exist are listed; new ones arrive with each phase. */
export const buildNav = (user: CurrentUserDto): NavSection[] => {
  const sections: NavSection[] = [{ label: "Workspace", items: [OVERVIEW] }];
  if (user.isPlatformAdmin) sections.push({ label: "Platform", items: [ADMIN_ORGS] });
  return sections;
};

export const isActivePath = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
