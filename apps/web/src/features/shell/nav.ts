import { ALLOWED_TRANSFER_TARGETS, type CurrentUserDto } from "@origo/shared";
import {
  ArrowLeftRight,
  Boxes,
  Building2,
  LayoutDashboard,
  type LucideIcon,
  Pill,
  Warehouse,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Count shown beside the item when something needs action (e.g. incoming transfers). */
  badge?: number;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface NavCounts {
  pendingIncoming: number;
}

/** True for a user whose organization is approved and can use the supply-chain features. */
export const isApprovedMember = (user: CurrentUserDto): boolean =>
  user.membership?.organization.status === "APPROVED";

/** True for a user who can register products and batches. */
export const isApprovedManufacturer = (user: CurrentUserDto): boolean =>
  isApprovedMember(user) && user.membership?.organization.type === "MANUFACTURER";

/** True when the user's organization is allowed to send stock onward (pharmacies aren't). */
export const canSendStock = (user: CurrentUserDto): boolean =>
  isApprovedMember(user) &&
  ALLOWED_TRANSFER_TARGETS[user.membership?.organization.type ?? "PHARMACY"].length > 0;

/** Navigation for this user. Only routes that exist are listed; new ones arrive with each phase. */
export const buildNav = (user: CurrentUserDto, counts: NavCounts): NavSection[] => {
  const sections: NavSection[] = [
    { label: "Workspace", items: [{ title: "Overview", href: ROUTES.dashboard, icon: LayoutDashboard }] },
  ];
  if (isApprovedManufacturer(user)) {
    sections.push({
      label: "Catalog",
      items: [
        { title: "Products", href: ROUTES.products, icon: Pill },
        { title: "Batches", href: ROUTES.batches, icon: Boxes },
      ],
    });
  }
  if (isApprovedMember(user)) {
    sections.push({
      label: "Supply chain",
      items: [
        { title: "Inventory", href: ROUTES.inventory, icon: Warehouse },
        {
          title: "Transfers",
          href: ROUTES.transfers,
          icon: ArrowLeftRight,
          ...(counts.pendingIncoming > 0 ? { badge: counts.pendingIncoming } : {}),
        },
      ],
    });
  }
  if (user.isPlatformAdmin) {
    sections.push({
      label: "Platform",
      items: [{ title: "Organizations", href: ROUTES.adminOrganizations, icon: Building2 }],
    });
  }
  return sections;
};

export const isActivePath = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
