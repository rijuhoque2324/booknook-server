
import { Router } from "express";

import {
  getBooks,
  getMyBooks,
  getSingleBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { validateRequest } from "../middleware/validate.middleware.js";

import {
  createBookSchema,
  listBooksQuerySchema,
  updateBookSchema,
} from "../validators/book.validator.js";

const router = Router();

// Public routes
router.get(
  "/",
  validateRequest(listBooksQuerySchema, "query"),
  getBooks
);

// Must stay above "/:id" so "mine" is not treated as a book ID.
router.get("/mine", verifyToken, getMyBooks);

router.get("/:id", getSingleBook);

// Protected routes
router.post(
  "/",
  verifyToken,
  validateRequest(createBookSchema, "body"),
  createBook
);

router.patch(
  "/:id",
  verifyToken,
  validateRequest(updateBookSchema, "body"),
  updateBook
);

router.delete(
  "/:id",
  verifyToken,
  deleteBook
);

export default router;
