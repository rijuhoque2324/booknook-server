
import type { Request, Response, NextFunction } from "express";

import {
  createNewBook,
  deleteBookById,
  updateBookById,
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

    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
    });
  } catch (error) {
    return next(error);
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
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const book = await getBookById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (error) {
    return next(error);
  }
}

// POST create new book
export async function createBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user?.email) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user information is missing.",
      });
    }

    const book = await createNewBook(req.body, {
      name: user.name || user.email,
      email: user.email,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    console.error("CREATE BOOK CONTROLLER ERROR:", error);
    return next(error);
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
    const user = req.user;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    if (!user?.email) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const updatedBook = await updateBookById(id, req.body);

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    return next(error);
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
    const user = req.user;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    if (!user?.email) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Only the authenticated owner can delete their book.
    const result = await deleteBookById(id);

    if (!result.success) {
      switch (result.reason) {
        case "INVALID_ID":
          return res.status(400).json({
            success: false,
            message: "Invalid book ID.",
          });

        case "NOT_FOUND":
          return res.status(404).json({
            success: false,
            message: "Book not found or you are not the owner.",
          });

        case "BOOK_BORROWED":
          return res.status(409).json({
            success: false,
            message: "Cannot delete this book because it has borrowing records.",
            borrowedCopies: result.borrowedCopies,
          });

        default:
          return res.status(500).json({
            success: false,
            message: "Unable to delete book.",
          });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE BOOK CONTROLLER ERROR:", error);
    return next(error);
  }
}
