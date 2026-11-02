import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// GET all books
export async function getAllBooks() {
  const db = await getDB();

  return db
    .collection("books")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

// GET single book by ID
export async function getBookById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = await getDB();

  const book = await db.collection("books").findOne({
    _id: new ObjectId(id),
  });

  return book;
}