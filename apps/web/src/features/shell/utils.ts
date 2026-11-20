const MAX_INITIALS = 2;

export const initialsOf = (fullName: string): string =>
  fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
