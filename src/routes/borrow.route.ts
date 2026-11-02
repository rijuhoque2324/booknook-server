import { Router } from "express";

const router = Router();

// POST /borrows
router.post("/", (req, res) => {
  res.json({ message: "Borrow book" });
});

// GET /borrows
router.get("/", (req, res) => {
  res.json({ message: "Get borrow history" });
});

// DELETE /borrows/:id
router.delete("/:id", (req, res) => {
  res.json({ message: "Return book" });
});

export default router;