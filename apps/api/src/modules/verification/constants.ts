import { type VerificationReason, type VerificationReasonDto } from "@origo/shared";

/** More scans than this suggests the code has been copied onto other packs. */
export const MANY_SCANS_THRESHOLD = 25;

/** Scans from two or more cities within this window suggest copies in circulation. */
export const SPREAD_WINDOW_HOURS = 24;

export const VERIFY_THROTTLE = { default: { limit: 30, ttl: 60_000 } } as const;

export const GEO_HEADERS = {
  secret: "x-origo-proxy-secret",
  city: "x-origo-geo-city",
  country: "x-origo-geo-country",
} as const;

/** What each warning means for the person holding the pack, in plain words. */
export const REASON_COPY: Record<VerificationReason, Omit<VerificationReasonDto, "code">> = {
  CODE_NOT_SCANNED: {
    title: "Scan the code to finish the check",
    detail: "This pack ID exists, but only scanning the QR code on the pack proves the label is genuine.",
  },
  RECALLED: {
    title: "This batch has been recalled",
    detail: "Don't use this medicine. Return it to the pharmacy where you got it.",
  },
  EXPIRED: {
    title: "This medicine has expired",
    detail: "Don't use it after the expiry date. Ask your pharmacist for a replacement.",
  },
  NOT_AT_PHARMACY: {
    title: "This pack hasn't reached a pharmacy yet",
    detail: "Our records show it still with a supplier. If you bought it from a shop or pharmacy, report it.",
  },
  MANY_SCANS: {
    title: "This code has been scanned unusually often",
    detail: "The label may have been copied onto other packs. Check the packaging and ask your pharmacist.",
  },
  SCANNED_IN_MANY_PLACES: {
    title: "This code was scanned in different cities",
    detail: "The same code turned up in more than one city in a short time, which can mean copied labels.",
  },
  HISTORY_BROKEN: {
    title: "This pack's records don't add up",
    detail: "Its history failed our integrity check. Don't use it until the pharmacy confirms it.",
  },
};
