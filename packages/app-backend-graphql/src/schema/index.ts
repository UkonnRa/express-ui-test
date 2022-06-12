import { gql } from "apollo-server";
import USER_GRAPHQL_SCHEMA from "./user.graphql";
import GROUP_GRAPHQL_SCHEMA from "./group.graphql";

const ROOT_SCHEMA = gql`
  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String
    endCursor: String
  }

  input Sort {
    field: String!
    order: Order!
  }

  enum Order {
    ASC
    DESC
  }

  type Query {
    user(query: String): User
    users(
      query: String
      first: Int
      after: String
      last: Int
      before: String
      offset: Int
      sort: [Sort!]!
    ): UserConnection!

    group(query: String): Group
    groups(
      query: String
      first: Int
      after: String
      last: Int
      before: String
      offset: Int
      sort: [Sort!]!
    ): GroupConnection!
  }
`;
const SCHEMAS = [ROOT_SCHEMA, USER_GRAPHQL_SCHEMA, GROUP_GRAPHQL_SCHEMA];

export default SCHEMAS;
