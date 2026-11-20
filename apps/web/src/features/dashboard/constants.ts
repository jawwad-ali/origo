import { type OrgType } from "@origo/shared";
import {
  ArrowLeftRight,
  Boxes,
  ClipboardCheck,
  History,
  type LucideIcon,
  PackagePlus,
  QrCode,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

export interface WorkflowStep {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Set once the feature has shipped; the step then links to it. */
  href?: string;
}

/** What each role does on Origo, in order. Shown on the overview until the features ship. */
export const ROLE_WORKFLOWS: Record<OrgType, WorkflowStep[]> = {
  MANUFACTURER: [
    {
      title: "Add your products",
      description: "Name, strength, dosage form and storage rules.",
      icon: PackagePlus,
      href: ROUTES.products,
    },
    {
      title: "Register a batch",
      description: "Each pack in the batch gets its own signed identity.",
      icon: Boxes,
      href: ROUTES.products,
    },
    {
      title: "Print QR labels",
      description: "Export print-ready labels for the packaging line.",
      icon: QrCode,
      href: ROUTES.batches,
    },
    {
      title: "Ship to distributors",
      description: "Send packs; they confirm receipt on their side.",
      icon: Truck,
    },
  ],
  DISTRIBUTOR: [
    {
      title: "Accept incoming stock",
      description: "Confirm transfers sent by manufacturers.",
      icon: ClipboardCheck,
    },
    {
      title: "Check pack history",
      description: "See every handover a pack has been through.",
      icon: History,
    },
    { title: "Ship onward", description: "Transfer to wholesalers or pharmacies.", icon: ArrowLeftRight },
  ],
  WHOLESALER: [
    {
      title: "Accept incoming stock",
      description: "Confirm transfers from distributors.",
      icon: ClipboardCheck,
    },
    { title: "Check pack history", description: "Spot packs that skipped an expected step.", icon: History },
    {
      title: "Supply pharmacies",
      description: "Transfer stock to the pharmacies you serve.",
      icon: ArrowLeftRight,
    },
  ],
  PHARMACY: [
    {
      title: "Receive stock",
      description: "Confirm deliveries before packs go on the shelf.",
      icon: ClipboardCheck,
    },
    {
      title: "Dispense to patients",
      description: "Mark packs as dispensed when they leave the counter.",
      icon: Boxes,
    },
    {
      title: "Act on recalls",
      description: "See recalled packs in your stock right away.",
      icon: ShieldAlert,
    },
  ],
};
