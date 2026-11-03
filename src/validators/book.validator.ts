
import { z } from "zod";
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;

const categorySchema = z.string().trim().min(1).max(50);

const imageSchema = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine(
    (value) => /^https?:\/\//i.test(value),
    "Image must be an http or https URL."
  );

const totalCopiesSchema = z.number().int().min(1).max(10000);

export const listBooksQuerySchema = z.object({
  category: categorySchema.optional(),
});

export const createBookSchema = z.object({
  title: z.string().trim().min(2).max(150),
  author: z.string().trim().min(2).max(100),
  category: categorySchema,
  description: z.string().trim().min(10).max(2000),
  image: imageSchema,
  totalCopies: totalCopiesSchema,
});

export const updateBookSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  author: z.string().trim().min(2).max(100).optional(),
  category: categorySchema.optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  image: imageSchema.optional(),
  totalCopies: totalCopiesSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required."
);
