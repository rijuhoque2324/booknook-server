
import "dotenv/config";
import { connectDB, client } from "../config/db.js";

const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    description:
      "A classic novel exploring wealth, love, ambition and the American Dream.",
    image: "https://placehold.co/400x600?text=The+Great+Gatsby",
    price: 450,
    totalCopies: 10,
    availableCopies: 10,
    ownerName: "BookNook Demo",
    ownerEmail: "demo@booknook.local",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Development",
    description:
      "A practical guide to building good habits and breaking bad ones.",
    image: "https://placehold.co/400x600?text=Atomic+Habits",
    price: 550,
    totalCopies: 8,
    availableCopies: 8,
    ownerName: "BookNook Demo",
    ownerEmail: "demo@booknook.local",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    description:
      "A philosophical story about following your dreams and discovering your purpose.",
    image: "https://placehold.co/400x600?text=The+Alchemist",
    price: 400,
    totalCopies: 12,
    availableCopies: 12,
    ownerName: "BookNook Demo",
    ownerEmail: "demo@booknook.local",
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "History",
    description:
      "An exploration of human history, from early humans to the modern world.",
    image: "https://placehold.co/400x600?text=Sapiens",
    price: 650,
    totalCopies: 6,
    availableCopies: 6,
    ownerName: "BookNook Demo",
    ownerEmail: "demo@booknook.local",
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Technology",
    description:
      "A guide to writing readable, maintainable and professional software.",
    image: "https://placehold.co/400x600?text=Clean+Code",
    price: 750,
    totalCopies: 5,
    availableCopies: 5,
    ownerName: "BookNook Demo",
    ownerEmail: "demo@booknook.local",
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    description:
      "An introduction to the universe, black holes, time and modern cosmology.",
    image: "https://placehold.co/400x600?text=Brief+History+of+Time",
    price: 600,
    totalCopies: 7,
    availableCopies: 7,
    ownerName: "BookNook Demo",
    ownerEmail: "demo@booknook.local",
  },
];

async function seedBooks() {
  try {
    const db = await connectDB();

    const booksCollection = db.collection("books");

    const existingBooks = await booksCollection.countDocuments();

    if (existingBooks > 0) {
      console.log(
        `Seed skipped: ${existingBooks} books already exist.`
      );
      return;
    }

    const now = new Date();

    const booksWithTimestamps = sampleBooks.map((book) => ({
      ...book,
      createdAt: now,
      updatedAt: now,
    }));

    const result = await booksCollection.insertMany(
      booksWithTimestamps
    );

    console.log(`${result.insertedCount} books inserted successfully!`);
  } catch (error) {
    console.error("Book seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedBooks();
