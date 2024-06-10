import { Invitation } from '../../service-layer';

// for testing
export const generateInvitations = (idOverride?: string): Invitation =>
  <any>{
    id: idOverride || (Math.floor(Math.random() * 100) + 1).toString(),
    name: 'Test name',
    description: 'Test description'
  };

export const generateInvitationsArray = (count = 10): Invitation[] =>
  // Overwrite random id generation to prevent duplicate IDs:
  Array.apply(null, Array(count)).map((value, index) => generateInvitations(index + 1));

export const generateInvitationsMap = (
  invitationsArray: Array<Invitation> = generateInvitationsArray()
): { ids: Array<string>; entities: any } => ({
  entities: invitationsArray.reduce((invitationsMap, invitations) => ({ ...invitationsMap, [invitations.id]: invitations }), {}),
  ids: invitationsArray.map((invitations) => invitations.id)
});
