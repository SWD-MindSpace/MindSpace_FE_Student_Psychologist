export interface Psychologist {
  id: number;
  fullName: string;
  bio: string;
  averageRating: number;
  sessionPrice: number;
  specialization: {
    id: number;
    name: string;
  };
  imageUrl?: string;
}
