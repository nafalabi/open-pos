import { z } from "zod";

export const UserPayloadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  level: z.number(),
  password: z.string(),
});
export type UserPayload = z.infer<typeof UserPayloadSchema>;

export const CategoryPayloadSchema = z.object({
  name: z.string().min(1),
});
export type CategoryPayload = z.infer<typeof CategoryPayloadSchema>;

export const ProductPayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().gte(0),
  image: z.string(),
  stock: z.number().gte(0),
  categories: z.string().array().nullable(),
});
export type ProductPayload = z.infer<typeof ProductPayloadSchema>;

export const OrderItemPayloadSchema = z.object({
  product_id: z.string().min(1),
  quantity: z
    .number()
    .gte(1)
    .refine((val) => val !== 0),
});
export type OrderItemPayload = z.infer<typeof OrderItemPayloadSchema>;

export const OrderPayloadSchema = z.object({
  items: OrderItemPayloadSchema.array().min(1),
  payment_method: z.string(),
  remarks: z.string(),
  recipient: z.string(),
});
export type OrderPayload = z.infer<typeof OrderPayloadSchema>;
