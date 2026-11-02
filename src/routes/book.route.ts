import { Router } from "express";

import { getBooks } from "../controllers/book.controller.js";

const router = Router();

// GET /books
router.get("/", getBooks);

export default router;