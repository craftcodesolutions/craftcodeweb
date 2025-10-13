
export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  profileImage?: string;
  bio?: string;
  status?: boolean;
  name?: string;
  picture?: string;
  designations?: string[];
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VerificationCode {
  _id?: string;
  email: string;
  code: string;
  type: 'registration' | 'password-reset';
  expiresAt: Date;
  createdAt: Date;
}
