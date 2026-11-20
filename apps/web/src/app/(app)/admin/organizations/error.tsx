"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function OrganizationsError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} title="Couldn't load organizations" />;
}
