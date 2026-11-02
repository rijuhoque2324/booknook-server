import type { Request, Response, NextFunction } from "express";

import {
  getAllBooks,
  getBookById,
} from "../services/book.service.js";

// GET all books
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

// GET single book
export async function getSingleBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const book = await getBookById(req.params.id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
}