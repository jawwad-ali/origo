import type { MembershipRole, OrgStatus, OrgType } from "../enums";

export interface OrganizationDto {
  id: string;
  name: string;
  type: OrgType;
  status: OrgStatus;
  licenseNumber: string;
  city: string;
  country: string;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface MembershipDto {
  role: MembershipRole;
  organization: OrganizationDto;
}

export interface CurrentUserDto {
  id: string;
  email: string;
  fullName: string;
  isPlatformAdmin: boolean;
  membership: MembershipDto | null;
}

export interface PaginatedDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

/** RFC 9457 problem details, the shape of every API error. */
export interface ProblemDetailsDto {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  requestId?: string;
  errors?: Record<string, string[]>;
}

export interface HealthDto {
  status: "ok" | "error";
  checks: Record<string, "up" | "down">;
}
