import { gql } from "apollo-server";

const USER_GRAPHQL_SCHEMA = gql`
  type UserConnection {
    pageInfo: PageInfo!
    edges: [UserEdge!]!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  type User {
    id: ID!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    name: String!
    role: Role!
    authIds: [AuthId!]!
  }

  enum Role {
    USER
    ADMIN
    OWNER
  }

  type AuthId {
    provider: String!
    value: String!
  }
`;

export default USER_GRAPHQL_SCHEMA;
