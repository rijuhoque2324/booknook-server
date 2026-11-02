
export interface Book {
  _id?: string;

  title: string;
  author: string;
  category: string;
  description: string;

  image: string;
  price: number;

  totalCopies: number;
  availableCopies: number;

  ownerName: string;
  ownerEmail: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface Borrow {
  _id?: string;

  bookId: string;
  bookTitle: string;

  userName: string;
  userEmail: string;

  borrowDate: Date;
  returnDate: Date;

  status: "active" | "returned";

  createdAt: Date;
  updatedAt: Date;
}
