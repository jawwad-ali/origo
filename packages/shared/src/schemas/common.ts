import { z } from "zod";

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type PageQuery = z.infer<typeof pageQuerySchema>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A calendar date as "YYYY-MM-DD" (no time, no timezone). */
export const isoDateSchema = z
  .string()
  .regex(ISO_DATE, "Use the format YYYY-MM-DD")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Enter a real date");

export const searchTermSchema = z.string().trim().max(100).optional();
