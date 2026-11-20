import { type OrgStatus } from "@origo/shared";

export interface OrgListParams {
  status?: OrgStatus;
  page: number;
  pageSize: number;
}

export type StatusCounts = Record<OrgStatus, number>;

export type ReviewAction = "approve" | "reject" | "suspend";
