import { Router } from "express";

import { validateRequest } from "../middleware/validate.middleware.js";
import { verifyToken } from "../middleware/verifyToken.js";

import {
  createBorrowSchema,
  returnBorrowSchema,
} from "../validators/borrow.validator.js";

import {
  createBorrowController,
  getMyBorrowsController,
  returnBorrowController,
} from "../controllers/borrow.controller.js";

const router = Router();

router.use(verifyToken);

router.post(
  "/",
  validateRequest(createBorrowSchema),
  createBorrowController
);

router.get(
  "/",
  getMyBorrowsController
);

router.delete(
  "/:id",
  validateRequest(returnBorrowSchema),
  returnBorrowController
);

export default router;