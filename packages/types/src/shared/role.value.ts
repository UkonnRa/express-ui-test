export enum RoleValue {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

function roleToNumber(role: RoleValue): number {
  switch (role) {
    case RoleValue.OWNER:
      return 2;
    case RoleValue.ADMIN:
      return 1;
    case RoleValue.USER:
      return 0;
  }
}

export function compareRole(a: RoleValue, b: RoleValue): number {
  return roleToNumber(a) - roleToNumber(b);
}
