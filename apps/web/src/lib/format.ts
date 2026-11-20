const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export const formatDate = (iso: string): string => DATE_FORMAT.format(new Date(iso));

export const formatNumber = (value: number): string => NUMBER_FORMAT.format(value);
