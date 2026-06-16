export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'psychologist' | 'admin';
  status: string;
  photoURL: string;
  phoneNumber: string;
  bio: string;
  birthDate: string;
  gender: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  favorites: string[];
  savedArticles: string[];
  settings: Record<string, any>;
  notificationSettings: Record<string, any>;
  createdAt: string;
  lastSignInAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userWa: string;
  psychologistId: string;
  psychologistName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  mode: string;
  complaint: string;
  notes?: string;
  fee: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Psychologist {
  id: string;
  userId: string;
  email: string;
  name: string;
  displayName: string;
  role: string;
  status: string;
  specialty?: string;
  fee?: number;
  experience?: string;
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
  bio?: string;
  photoUrl?: string;
  serviceIds?: string[];
  gelar?: string;
}

export interface Notification {
  id: string;
  userId: string;
  psychologistId?: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  authorName: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
