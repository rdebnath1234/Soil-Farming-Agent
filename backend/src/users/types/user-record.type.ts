import { Role } from '../role.enum';

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
