import { ProductPayloadSchema } from "@/generated/schema";
import { z } from "zod";

export const ProductFormSchema = ProductPayloadSchema.omit({ categories: true }).merge(
  z.object({
    id: z.string().optional(),
    categories: z
      .object({
        label: z.string(),
        value: z.string(),
      })
      .array(),
  })
);

export type ProductForm = z.infer<typeof ProductFormSchema>;
