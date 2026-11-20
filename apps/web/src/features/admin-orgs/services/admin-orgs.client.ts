import { type OrganizationDto } from "@origo/shared";
import { postJson } from "@/lib/api/client-api";
import { API_ROUTES } from "@/lib/api/constants";

const actionPath = (id: string, action: string): string =>
  `${API_ROUTES.adminOrganizations}/${encodeURIComponent(id)}/${action}`;

export const approveOrganization = (id: string): Promise<OrganizationDto> =>
  postJson(actionPath(id, "approve"));

export const rejectOrganization = (id: string, reason: string): Promise<OrganizationDto> =>
  postJson(actionPath(id, "reject"), { reason });

export const suspendOrganization = (id: string): Promise<OrganizationDto> =>
  postJson(actionPath(id, "suspend"));
