import "server-only";
import { type OrganizationDto, type OrgStatus, type PaginatedDto } from "@origo/shared";
import { API_ROUTES } from "@/lib/api/constants";
import { serverApi } from "@/lib/api/server-api";
import { type OrgListParams, type StatusCounts } from "../types";

export const listOrganizations = (params: OrgListParams): Promise<PaginatedDto<OrganizationDto>> => {
  const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize) });
  if (params.status) query.set("status", params.status);
  return serverApi(`${API_ROUTES.adminOrganizations}?${query.toString()}`);
};

const countByStatus = async (status: OrgStatus): Promise<number> =>
  (await listOrganizations({ status, page: 1, pageSize: 1 })).total;

export const getStatusCounts = async (): Promise<StatusCounts> => {
  const [pending, approved, rejected, suspended] = await Promise.all([
    countByStatus("PENDING"),
    countByStatus("APPROVED"),
    countByStatus("REJECTED"),
    countByStatus("SUSPENDED"),
  ]);
  return { PENDING: pending, APPROVED: approved, REJECTED: rejected, SUSPENDED: suspended };
};
