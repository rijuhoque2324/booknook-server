import { Router } from "express";
import { validateRequest } from "../middleware/validate.middleware.js";
import { createBookSchema, updateBookSchema } from "../validators/book.validator.js";

import {
  getBooks,
  getSingleBook,
  createBook,
  updateBook,
  deleteBook ,
} from "../controllers/book.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// GET /books
router.get("/", getBooks);

// GET /books/:id
router.get("/:id", getSingleBook);

// POST /books
router.post(
  "/",
  verifyToken,
  validateRequest(createBookSchema),
  createBook
);

// PATCH /books/:id
router.patch("/:id", validateRequest(updateBookSchema), updateBook);

//Delete book
router.delete("/:id", verifyToken, deleteBook);

export default router;