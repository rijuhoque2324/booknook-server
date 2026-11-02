import { getDB } from "../config/db.js";

export async function getAllBooks() {
  const db = await getDB();

  const books = await db
    .collection("books")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return books;
}