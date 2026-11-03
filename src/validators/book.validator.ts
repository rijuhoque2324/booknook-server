import { z } from "zod";

// Create Book Validation
export const createBookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Book title must be at least 2 characters"),

  author: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),

  image: z
    .string()
    .url("Please provide a valid image URL"),

  totalCopies: z
    .number()
    .int("Total copies must be a whole number")
    .min(1, "At least one copy is required"),
});

// TypeScript type from Zod schema
export type CreateBookInput = z.infer<typeof createBookSchema>;

// Update Book Validation
export const updateBookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Book title must be at least 2 characters")
    .optional(),

  author: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters")
    .optional(),

  category: z
    .string()
    .trim()
    .min(2, "Category is required")
    .optional(),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .optional(),

  image: z
    .string()
    .url("Please provide a valid image URL")
    .optional(),

  totalCopies: z
    .number()
    .int("Total copies must be a whole number")
    .min(1, "At least one copy is required")
    .optional(),
});

export type UpdateBookInput = z.infer<typeof updateBookSchema>;