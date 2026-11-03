
import type { Request, Response } from "express";

import {
  createBorrow,
  getMyBorrows,
  returnBorrow,
} from "../services/borrow.service.js";

// Authenticated request type
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// ============================================
// POST /borrows
// Create a new borrow
// ============================================

export async function createBorrowController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { bookId } = req.body;

    if (!bookId || typeof bookId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid bookId is required.",
      });
    }

    const borrow = await createBorrow({
      bookId,
      borrowerId: user.id,
      borrowerEmail: user.email,
      borrowerName: user.name || user.email,
    });

    return res.status(201).json({
      success: true,
      message: "Book borrowed successfully.",
      data: borrow,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_BOOK_ID":
          return res.status(400).json({
            success: false,
            message: "Invalid book ID.",
          });

        case "ALREADY_BORROWED":
          return res.status(409).json({
            success: false,
            message: "You have already borrowed this book.",
          });

        case "BOOK_UNAVAILABLE":
          return res.status(409).json({
            success: false,
            message: "This book is currently unavailable.",
          });
      }
    }

    console.error("Create borrow error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to borrow book.",
    });
  }
}

// ============================================
// GET /borrows
// Get logged-in user's borrow history
// ============================================

export async function getMyBorrowsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const borrows = await getMyBorrows(user.id);

    return res.status(200).json({
      success: true,
      message: "Borrow history retrieved successfully.",
      data: borrows,
    });
  } catch (error) {
    console.error("Get borrows error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve borrow history.",
    });
  }
}

// ============================================
// DELETE /borrows/:id
// Return a borrowed book
// ============================================

export async function returnBorrowController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const borrowId = req.params.id;

    // Validate borrow ID
    if (!borrowId || typeof borrowId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid borrow ID is required.",
      });
    }

    const borrow = await returnBorrow(borrowId, user.id);

    return res.status(200).json({
      success: true,
      message: "Book returned successfully.",
      data: borrow,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_BORROW_ID":
          return res.status(400).json({
            success: false,
            message: "Invalid borrow ID.",
          });

        case "BORROW_NOT_FOUND":
        case "BORROW_ALREADY_RETURNED":
          return res.status(404).json({
            success: false,
            message: "Active borrow record not found.",
          });

        case "BOOK_COPY_RESTORE_FAILED":
          return res.status(409).json({
            success: false,
            message:
              "Could not restore the book copy. Please contact support.",
          });
      }
    }

    console.error("Return borrow error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to return book.",
    });
  }
}
