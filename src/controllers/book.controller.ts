import type { Request, Response, NextFunction } from "express";

import { createNewBook, deleteBookById, updateBookById } from "../services/book.service.js";

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
    const id = req.params.id;
    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
      return;
    }

    const book = await getBookById(id);

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
// POST create new book

export async function createBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as Request & { user: { name: string; email: string } }).user;
    const book = await createNewBook(req.body, {
      name: user.name,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH update book
export async function updateBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
      return;
    }

    const updatedBook = await updateBookById(id, req.body);

    if (!updatedBook) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE book
export async function deleteBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
      return;
    }

    const result = await deleteBookById(id);

    if (!result.success) {
      if (result.reason === "INVALID_ID") {
        res.status(400).json({
          success: false,
          message: "Invalid book ID",
        });
        return;
      }

      if (result.reason === "NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: "Book not found",
        });
        return;
      }

      if (result.reason === "BOOK_BORROWED") {
        res.status(409).json({
          success: false,
          message: "Cannot delete this book because copies are currently borrowed.",
          borrowedCopies: result.borrowedCopies,
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}