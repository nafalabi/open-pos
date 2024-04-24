import { z } from "zod";

export const UserBaseSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  level: z.number().refine((val) => val !== 0),
});
export type UserBase = z.infer<typeof UserBaseSchema>;

export const BaseSchema = z.object({
  id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Base = z.infer<typeof BaseSchema>;

export const UserSchema = z.object({}).merge(UserBaseSchema).merge(BaseSchema);
export type User = z.infer<typeof UserSchema>;

export const UserFillableSchema = z
  .object({
    password: z.string(),
  })
  .merge(UserBaseSchema);
export type UserFillable = z.infer<typeof UserFillableSchema>;

export const ProductFillableSchema = z.object({
  name: z.string().min(1),
});
export type ProductFillable = z.infer<typeof ProductFillableSchema>;

export const ProductSchema = z
  .object({})
  .merge(ProductFillableSchema)
  .merge(BaseSchema);
export type Product = z.infer<typeof ProductSchema>;
