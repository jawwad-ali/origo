import { PACK_ID_PREFIX } from "@origo/shared";

const SERIAL_MIN_DIGITS = 6;

/** MED-2026-000123: prefix, year of registration, serial padded to at least 6 digits. */
export const formatPackId = (serial: number, registeredAt: Date): string =>
  `${PACK_ID_PREFIX}-${registeredAt.getUTCFullYear()}-${String(serial).padStart(SERIAL_MIN_DIGITS, "0")}`;
