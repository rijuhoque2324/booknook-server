import type { Request, Response, NextFunction } from "express";
import { getAllBooks } from "../services/book.service.js";

export async function getBooks(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const books = await getAllBooks();

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
    });
  } catch (error) {
    next(error);
  }
}