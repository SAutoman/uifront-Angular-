import { User } from '../../service-layer';

export interface InvitationViewModel {
  id: string;
  senderName: string;
  emailAddress: string;
  role: string;
  createdAt: string;
  status: string;
  registeredUsers: User[];
}
