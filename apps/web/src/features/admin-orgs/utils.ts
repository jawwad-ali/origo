import { ORG_STATUSES, type OrgStatus } from "@origo/shared";
import { DEFAULT_STATUS_TAB } from "./constants";

export const parseStatus = (value: string | string[] | undefined): OrgStatus =>
  ORG_STATUSES.find((status) => status === value) ?? DEFAULT_STATUS_TAB;

export const parsePage = (value: string | string[] | undefined): number => {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};
