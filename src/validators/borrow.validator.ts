import { z } from "zod";

// Create borrow validation
export const createBorrowSchema = z.object({
  bookId: z
    .string()
    .min(1, "Book ID is required.")
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid book ID. A valid MongoDB ObjectId is required."
    ),
});

// Return borrow validation
export const returnBorrowSchema = z.object({
  id: z
    .string()
    .min(1, "Borrow ID is required.")
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid borrow ID. A valid MongoDB ObjectId is required."
    ),
});