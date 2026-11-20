/** Request details recorded with sessions and audit entries. */
export interface RequestMeta {
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
}
