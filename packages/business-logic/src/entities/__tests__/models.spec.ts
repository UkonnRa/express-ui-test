import { Journal, Role, User } from '@white-rabbit/business-logic';

test('Journals', () => {
  const user = new User({
    name: 'user 1',
    role: Role.ADMIN,
  });

  const journal = new Journal({
    name: 'Journal 2',
    admins: {
      type: 'ITEMS',
      items: [
        {
          type: 'USER',
          user,
        },
      ],
    },
    members: {
      type: 'USERS',
      users: [user],
    },
    records: [
      {
        user,
        timestamp: new Date(Date.UTC(2022, 0, 1)),
      },
    ],
  });

  expect(journal.name).toBe('Journal 2');
});
