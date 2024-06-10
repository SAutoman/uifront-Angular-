import { User } from '../../service-layer';

// for testing

export const generateUsers = (idOverride?: string): User =>
  <any>{
    id: idOverride || (Math.floor(Math.random() * 100) + 1).toString(),
    name: 'Test name',
    description: 'Test description'
  };

export const generateUsersArray = (count = 10): User[] =>
  // Overwrite random id generation to prevent duplicate IDs:
  Array.apply(null, Array(count)).map((value, index) => generateUsers(index + 1));

export const generateUsersMap = (usersArray: Array<User> = generateUsersArray()): { ids: Array<string>; entities: any } => ({
  entities: usersArray.reduce((usersMap, users) => ({ ...usersMap, [users.id]: users }), {}),
  ids: usersArray.map((users) => users.id)
});
