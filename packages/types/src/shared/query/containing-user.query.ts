export default interface ContainingUserQuery {
  type: "ContainingUserQuery";
  fields: string[];
  user: string;
}

export const CONTAINING_USER_OPERATOR = "$containingUser";
