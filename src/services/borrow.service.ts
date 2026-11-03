
import { ObjectId } from "mongodb";
import type { ClientSession } from "mongodb";
import { getDB } from "../config/db.js";

interface CreateBorrowInput {
  bookId: string;
  borrowerId: string;
  borrowerEmail: string;
  borrowerName: string;
}

const BOOKS_COLLECTION = "books";
const BORROWS_COLLECTION = "borrows";

// Create indexes once during server startup.
export async function ensureBorrowIndexes() {
  const db = await getDB();

  const borrows = db.collection(BORROWS_COLLECTION);

  await borrows.createIndex(
    { bookId: 1, borrowerId: 1 },
    {
      unique: true,
      partialFilterExpression: { status: "active" },
      name: "unique_active_borrow_per_user_book",
    }
  );

  await borrows.createIndex(
    { borrowerId: 1, createdAt: -1 },
    { name: "borrower_history_index" }
  );

  await borrows.createIndex(
    { bookId: 1, createdAt: -1 },
    { name: "book_borrow_history_index" }
  );
}

// Helper: identify MongoDB duplicate-key errors.
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

// Create a borrow record.
export async function createBorrow(input: CreateBorrowInput) {
  if (!ObjectId.isValid(input.bookId)) {
    throw new Error("INVALID_BOOK_ID");
  }

  if (!input.borrowerId || !input.borrowerEmail) {
    throw new Error("INVALID_BORROWER");
  }

  const db = await getDB();

  const books = db.collection(BOOKS_COLLECTION);
  const borrows = db.collection(BORROWS_COLLECTION);

  const bookObjectId = new ObjectId(input.bookId);

  const session = db.client.startSession();

  try {
    let createdBorrow: Record<string, unknown> | null = null;

    await session.withTransaction(async () => {
      // Check whether the book exists.
      const book = await books.findOne(
        { _id: bookObjectId },
        { session }
      );

      if (!book) {
        throw new Error("BOOK_NOT_FOUND");
      }

      // Prevent duplicate active borrowing.
      const existingBorrow = await borrows.findOne(
        {
          bookId: bookObjectId,
          borrowerId: input.borrowerId,
          status: "active",
        },
        { session }
      );

      if (existingBorrow) {
        throw new Error("ALREADY_BORROWED");
      }

      // Atomically decrease available copies.
      const updateResult = await books.updateOne(
        {
          _id: bookObjectId,
          availableCopies: { $gt: 0 },
        },
        {
          $inc: { availableCopies: -1 },
          $set: { updatedAt: new Date() },
        },
        { session }
      );

      if (updateResult.modifiedCount !== 1) {
        throw new Error("BOOK_UNAVAILABLE");
      }

      const now = new Date();

      const borrowRecord = {
        bookId: bookObjectId,
        borrowerId: input.borrowerId,
        borrowerEmail: input.borrowerEmail,
        borrowerName: input.borrowerName,
        borrowDate: now,
        returnedAt: null,
        status: "active",
        createdAt: now,
        updatedAt: now,
      };

      const insertResult = await borrows.insertOne(
        borrowRecord,
        { session }
      );

      createdBorrow = {
        _id: insertResult.insertedId,
        ...borrowRecord,
      };
    });

    return createdBorrow;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new Error("ALREADY_BORROWED");
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

// Get all borrow records of the authenticated user.
export async function getMyBorrows(borrowerId: string) {
  if (!borrowerId) {
    throw new Error("INVALID_BORROWER");
  }

  const db = await getDB();

  return db
    .collection(BORROWS_COLLECTION)
    .aggregate([
      {
        $match: { borrowerId },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: BOOKS_COLLECTION,
          localField: "bookId",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: {
          path: "$book",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          borrowerId: 1,
          borrowerEmail: 1,
          borrowerName: 1,
          borrowDate: 1,
          returnedAt: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          book: {
            _id: "$book._id",
            title: "$book.title",
            author: "$book.author",
            category: "$book.category",
            image: "$book.image",
            totalCopies: "$book.totalCopies",
            availableCopies: "$book.availableCopies",
          },
        },
      },
    ])
    .toArray();
}

// Return a borrowed book.
export async function returnBorrow(
  borrowId: string,
  borrowerId: string
) {
  if (!ObjectId.isValid(borrowId)) {
    throw new Error("INVALID_BORROW_ID");
  }

  if (!borrowerId) {
    throw new Error("INVALID_BORROWER");
  }

  const db = await getDB();

  const borrows = db.collection(BORROWS_COLLECTION);
  const books = db.collection(BOOKS_COLLECTION);

  const borrowObjectId = new ObjectId(borrowId);

  const session = db.client.startSession();

  try {
    let returnedBorrow: Record<string, unknown> | null = null;

    await session.withTransaction(async () => {
      // Find only this user's active borrow.
      const borrow = await borrows.findOne(
        {
          _id: borrowObjectId,
          borrowerId,
          status: "active",
        },
        { session }
      );

      if (!borrow) {
        throw new Error("BORROW_NOT_FOUND");
      }

      // Mark the borrow as returned.
      const borrowUpdate = await borrows.updateOne(
        {
          _id: borrowObjectId,
          borrowerId,
          status: "active",
        },
        {
          $set: {
            status: "returned",
            returnedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { session }
      );

      if (borrowUpdate.modifiedCount !== 1) {
        throw new Error("BORROW_ALREADY_RETURNED");
      }

      // Restore exactly one available copy.
      const bookUpdate = await books.updateOne(
        {
          _id: borrow.bookId,
          $expr: {
            $lt: ["$availableCopies", "$totalCopies"],
          },
        },
        {
          $inc: { availableCopies: 1 },
          $set: { updatedAt: new Date() },
        },
        { session }
      );

      if (bookUpdate.modifiedCount !== 1) {
        throw new Error("BOOK_COPY_RESTORE_FAILED");
      }

      returnedBorrow = await borrows.findOne(
        { _id: borrowObjectId },
        { session }
      );
    });

    return returnedBorrow;
  } finally {
    await session.endSession();
  }
}
