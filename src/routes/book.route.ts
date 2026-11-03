
import { Router } from "express";

import {
  getBooks,
  getSingleBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { validateRequest } from "../middleware/validate.middleware.js";

import {
  createBookSchema,
  updateBookSchema,
} from "../validators/book.validator.js";

const router = Router();

// Public routes
router.get("/", getBooks);
router.get("/:id", getSingleBook);

// Protected routes
router.post(
  "/",
  verifyToken,
  validateRequest(createBookSchema),
  createBook
);

router.patch(
  "/:id",
  verifyToken,
  validateRequest(updateBookSchema),
  updateBook
);

router.delete(
  "/:id",
  verifyToken,
  deleteBook
);

export default router;
