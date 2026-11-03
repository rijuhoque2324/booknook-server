
import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().trim().min(2).max(150),
  author: z.string().trim().min(2).max(100),
  category: z.string().trim().min(1),
  description: z.string().trim().min(10).max(2000),
  image: z.string().trim().url(),
  totalCopies: z.number().int().min(1),
});

export const updateBookSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  author: z.string().trim().min(2).max(100).optional(),
  category: z.string().trim().min(1).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  image: z.string().trim().url().optional(),
  totalCopies: z.number().int().min(1).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required."
);
