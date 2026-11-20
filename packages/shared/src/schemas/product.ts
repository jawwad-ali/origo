import { z } from "zod";
import { NAME_MAX_LENGTH, PRODUCT_TEXT_MAX_LENGTH } from "../constants";
import { DOSAGE_FORMS } from "../enums";
import { pageQuerySchema, searchTermSchema } from "./common";

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Enter the brand or product name").max(NAME_MAX_LENGTH),
  genericName: z.string().trim().min(2, "Enter the generic name").max(NAME_MAX_LENGTH),
  strength: z.string().trim().min(1, "Enter the strength, e.g. 500 mg").max(40),
  dosageForm: z.enum(DOSAGE_FORMS, { error: "Choose the dosage form" }),
  packSize: z.string().trim().min(1, "Enter the pack size, e.g. 20 tablets").max(60),
  storageInstructions: z
    .string()
    .trim()
    .min(3, "Enter the storage instructions")
    .max(PRODUCT_TEXT_MAX_LENGTH),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const listProductsQuerySchema = pageQuerySchema.extend({ q: searchTermSchema });
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
