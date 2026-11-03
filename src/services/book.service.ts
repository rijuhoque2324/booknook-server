import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { ApiError } from "../utils/api-error.js";
import type { CreateBookInput, UpdateBookInput } from "../validators/book.validator.js";

// Owner emails must not be exposed on public endpoints.
const PUBLIC_BOOK_PROJECTION = { ownerEmail: 0 };

// Matches slugs like "self-development" to "Self Development".
const CATEGORY_COLLATION = {
  locale: "en",
  strength: 2,
  alternate: "shifted",
} as const;

// GET all books, optionally filtered by category
export async function getAllBooks(category?: string) {
  const db = await getDB();

  const cursor = category
    ? db
        .collection("books")
        .find({ category }, { collation: CATEGORY_COLLATION })
    : db.collection("books").find({});

  return cursor
    .project(PUBLIC_BOOK_PROJECTION)
    .sort({ createdAt: -1 })
    .toArray();
}

// GET books owned by a user
export async function getBooksByOwner(ownerEmail: string) {
  const db = await getDB();

  return db
    .collection("books")
    .find({ ownerEmail })
    .sort({ createdAt: -1 })
    .toArray();
}

// GET single book by ID
export async function getBookById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = await getDB();

  const book = await db.collection("books").findOne(
    { _id: new ObjectId(id) },
    { projection: PUBLIC_BOOK_PROJECTION }
  );

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
  bookData: UpdateBookInput,
  ownerEmail: string
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

  // Only the authenticated owner can update their book.
  if (existingBook.ownerEmail !== ownerEmail) {
    throw new ApiError(403, "You can only update your own books.");
  }

  // Calculate borrowed copies
  const borrowedCopies =
    existingBook.totalCopies - existingBook.availableCopies;

  // Prevent totalCopies from going below borrowed copies
  if (
    bookData.totalCopies !== undefined &&
    bookData.totalCopies < borrowedCopies
  ) {
    throw new ApiError(
      409,
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
export async function deleteBookById(id: string, ownerEmail: string) {
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

  // Only the authenticated owner can delete their book.
  if (book.ownerEmail !== ownerEmail) {
    return {
      success: false,
      reason: "NOT_OWNER",
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

  // Guard against a new borrow being created between the check and delete.
  const deleteResult = await db.collection("books").deleteOne({
    _id: objectId,
    availableCopies: book.totalCopies,
  });

  if (deleteResult.deletedCount !== 1) {
    return {
      success: false,
      reason: "DELETE_CONFLICT",
    };
  }

  return {
    success: true,
  };
}