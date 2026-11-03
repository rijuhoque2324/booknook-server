import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import type { CreateBookInput, UpdateBookInput } from "../validators/book.validator.js";

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


//create new book
export async function createNewBook(
  bookData: CreateBookInput,
  user: {
    name: string;
    email: string;
  }
) {
  const db = await getDB();
  const now = new Date();

  const newBook = {
    ...bookData,

    ownerName: user.name,
    ownerEmail: user.email,

    availableCopies: bookData.totalCopies,

    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("books").insertOne(newBook);

  return {
    _id: result.insertedId.toString(),
    ...newBook,
  };
}

// PATCH update book
export async function updateBookById(
  id: string,
  bookData: UpdateBookInput
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = await getDB();
  const collection = db.collection("books");

  const objectId = new ObjectId(id);

  // Find existing book
  const existingBook = await collection.findOne({
    _id: objectId,
  });

  if (!existingBook) {
    return null;
  }

  // Calculate borrowed copies
  const borrowedCopies =
    existingBook.totalCopies - existingBook.availableCopies;

  // Prevent totalCopies from going below borrowed copies
  if (
    bookData.totalCopies !== undefined &&
    bookData.totalCopies < borrowedCopies
  ) {
    throw new Error(
      `Cannot reduce total copies below ${borrowedCopies} borrowed copies.`
    );
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {
    ...bookData,
    updatedAt: new Date(),
  };

  // Recalculate available copies if totalCopies changes
  if (bookData.totalCopies !== undefined) {
    updateData.availableCopies =
      bookData.totalCopies - borrowedCopies;
  }

  await collection.updateOne(
    { _id: objectId },
    { $set: updateData }
  );

  return collection.findOne({ _id: objectId });
}

// DELETE book by ID
export async function deleteBookById(id: string) {
  if (!ObjectId.isValid(id)) {
    return {
      success: false,
      reason: "INVALID_ID",
    };
  }

  const db = await getDB();
  const objectId = new ObjectId(id);

  const book = await db.collection("books").findOne({
    _id: objectId,
  });

  if (!book) {
    return {
      success: false,
      reason: "NOT_FOUND",
    };
  }

  const borrowedCopies =
    book.totalCopies - book.availableCopies;

  if (borrowedCopies > 0) {
    return {
      success: false,
      reason: "BOOK_BORROWED",
      borrowedCopies,
    };
  }

  await db.collection("books").deleteOne({
    _id: objectId,
    availableCopies: book.totalCopies,
  });

  return {
    success: true,
  };
}