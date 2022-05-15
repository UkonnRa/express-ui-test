import { User } from "@white-rabbit/business-logic";
import faker from "@faker-js/faker";
import { Role } from "@white-rabbit/type-bridge";

const generateRole = (idx: number): Role => {
  const ratio = Math.random();
  if (idx < 2) return Role.OWNER;
  else if (idx < 4) return Role.ADMIN;
  else if (ratio < 0.1) return Role.OWNER;
  else if (ratio < 0.4) return Role.ADMIN;
  else return Role.USER;
};

const AUTH_IDS = faker.helpers.uniqueArray(faker.company.companyName, 10);

export const generateUsers = (length: number): User[] => {
  return Array.from({ length }, (_, idx) => {
    const user = new User({
      name: faker.name.findName(),
      role: generateRole(idx),
      authIds: new Map(
        faker.helpers
          .uniqueArray(AUTH_IDS, faker.datatype.number({ min: 2, max: 6 }))
          .map((id) => [id, faker.random.word()])
      ),
    });
    if (Math.random() > 0.3) {
      user.deleted = true;
    }
    return user;
  });
};
