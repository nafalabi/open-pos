import { ProductFillableSchema } from "@/generated/schema";
import { z } from "zod";

export const ProductFormSchema = ProductFillableSchema.omit({ categories: true }).merge(
  z.object({
    categories: z
      .object({
        label: z.string(),
        value: z.string(),
      })
      .array(),
  })
);

export type ProductForm = z.infer<typeof ProductFormSchema>;
