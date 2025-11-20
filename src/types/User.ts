
export interface User {
  _id?: string;
  firstName?: string; // Made optional for backward compatibility
  lastName?: string;  // Made optional for backward compatibility
  email: string;
  password: string;
  isAdmin?: boolean;
  profileImage?: string;
  bio?: string;
  status?: boolean;
  name?: string; // For backward compatibility with existing data
  picture?: string; // For backward compatibility with existing data
  designations?: string[];
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  publicId?: string;
  publicIdProfile?: string; // Additional field for profile image public ID
  userId?: string; // For frontend compatibility
  avatar?: string; // Alias for profileImage
}
export interface VerificationCode {
  _id?: string;
  email: string;
  code: string;
  type: 'registration' | 'password-reset';
  expiresAt: Date;
  createdAt: Date;
}
