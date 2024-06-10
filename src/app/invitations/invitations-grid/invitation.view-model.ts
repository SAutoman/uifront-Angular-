import { User } from '../../service-layer';

export interface InvitationViewModel {
  senderName: string;
  emailAddress: string;
  role: string;
  createdAt: string;
  status: string;
  registeredUsers: User[];
  isActive: boolean;
  invitationLink: string;
  multipleRegistrations: boolean;
  invitationSettingId: string;
}
