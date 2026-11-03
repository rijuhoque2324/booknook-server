import { Router } from "express";
import { validateRequest } from "../middleware/validate.middleware.js";
import { createBookSchema, updateBookSchema } from "../validators/book.validator.js";

import {
  getBooks,
  getSingleBook,
  createBook,
  updateBook,
} from "../controllers/book.controller.js";

const router = Router();

// GET /books
router.get("/", getBooks);

// GET /books/:id
router.get("/:id", getSingleBook);

// POST /books
router.post("/", validateRequest(createBookSchema), createBook);

// PATCH /books/:id
router.patch("/:id", validateRequest(updateBookSchema), updateBook);

export default router;