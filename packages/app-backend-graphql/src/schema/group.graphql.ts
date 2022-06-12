import { gql } from "apollo-server";

const GROUP_GRAPHQL_SCHEMA = gql`
  type GroupConnection {
    pageInfo: PageInfo!
    edges: [GroupEdge!]!
  }

  type GroupEdge {
    node: Group!
    cursor: String!
  }

  type Group {
    id: ID!
    createdAt: String!
    updatedAt: String!
    deletedAt: String

    name: String!
    description: String

    admins(
      query: String
      first: Int
      after: String
      last: Int
      before: String
      offset: Int
      sort: [Sort!]!
    ): UserConnection!

    members(
      query: String
      first: Int
      after: String
      last: Int
      before: String
      offset: Int
      sort: [Sort!]!
    ): UserConnection!
  }
`;

export default GROUP_GRAPHQL_SCHEMA;
