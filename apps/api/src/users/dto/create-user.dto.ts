export class CreateUserDto {
  id?: string;
  email: string;
  password: string;
  refreshToken?: string | null;
  role?: UserRole;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
  companyName: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  COMPANY = 'COMPANY',
}
