export const AUDIT_ACTIONS = {
  USER_SIGNED_UP: "user.signed_up",
  USER_LOGGED_IN: "user.logged_in",
  USER_LOGIN_FAILED: "user.login_failed",
  USER_LOGGED_OUT: "user.logged_out",
  SESSION_REUSE_DETECTED: "session.reuse_detected",
  ORG_CREATED: "organization.created",
  ORG_APPROVED: "organization.approved",
  ORG_REJECTED: "organization.rejected",
  ORG_SUSPENDED: "organization.suspended",
  PRODUCT_CREATED: "product.created",
  BATCH_REGISTERED: "batch.registered",
  LABEL_EXPORT_REQUESTED: "label_export.requested",
  LABEL_EXPORT_DOWNLOADED: "label_export.downloaded",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_ENTITIES = {
  USER: "user",
  ORGANIZATION: "organization",
  SESSION: "session",
  PRODUCT: "product",
  BATCH: "batch",
  LABEL_EXPORT: "label_export",
} as const;

export type AuditEntity = (typeof AUDIT_ENTITIES)[keyof typeof AUDIT_ENTITIES];
