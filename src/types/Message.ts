export interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Chat {
  _id?: string;
  participants: string[]; // Array of user IDs
  lastMessage?: Message;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Contact {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
