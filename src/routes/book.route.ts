import { Router } from "express";

import {
  getBooks,
  getSingleBook,
} from "../controllers/book.controller.js";

const router = Router();

// GET /books
router.get("/", getBooks);

// GET /books/:id
router.get("/:id", getSingleBook);

export default router;