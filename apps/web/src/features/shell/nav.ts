import { type CurrentUserDto } from "@origo/shared";
import { Boxes, Building2, LayoutDashboard, type LucideIcon, Pill } from "lucide-react";
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
const PRODUCTS: NavItem = { title: "Products", href: ROUTES.products, icon: Pill };
const BATCHES: NavItem = { title: "Batches", href: ROUTES.batches, icon: Boxes };
const ADMIN_ORGS: NavItem = { title: "Organizations", href: ROUTES.adminOrganizations, icon: Building2 };

/** True for a user who can register products and batches. */
export const isApprovedManufacturer = (user: CurrentUserDto): boolean =>
  user.membership?.organization.type === "MANUFACTURER" && user.membership.organization.status === "APPROVED";

/** Navigation for this user. Only routes that exist are listed; new ones arrive with each phase. */
export const buildNav = (user: CurrentUserDto): NavSection[] => {
  const sections: NavSection[] = [{ label: "Workspace", items: [OVERVIEW] }];
  if (isApprovedManufacturer(user)) sections.push({ label: "Catalog", items: [PRODUCTS, BATCHES] });
  if (user.isPlatformAdmin) sections.push({ label: "Platform", items: [ADMIN_ORGS] });
  return sections;
};

export const isActivePath = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
