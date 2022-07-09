import { UserApi, UserModel } from "@white-rabbit/frontend-api";
import { inject, singleton } from "tsyringe";
import { ApolloClient } from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { gql } from "graphql-tag";
import { User } from "oidc-client-ts";
import { FindPageInput, Page, UserQuery } from "@white-rabbit/types";
import { Connection, FindOneVariables, FindPageVariables } from "./types";

@singleton()
export default class UserGraphqlApi implements UserApi<User> {
  constructor(
    @inject(ApolloClient)
    private readonly client: ApolloClient<NormalizedCacheObject>
  ) {}

  async findOne(_: User, query?: object): Promise<UserModel | null> {
    const { data } = await this.client.query<
      { user: UserModel | null },
      FindOneVariables
    >({
      query: gql`
        query findOne($query: String) {
          user(query: $query) {
            id
            createdAt
            updatedAt

            name
            role
            authIds {
              provider
              value
            }
          }
        }
      `,
      variables: {
        query: query == null ? undefined : JSON.stringify(query),
      },
    });
    return data.user;
  }

  async findPage(
    _: User,
    { query, pagination, sort }: FindPageInput<UserQuery>
  ): Promise<Page<UserModel>> {
    const { data } = await this.client.query<
      { users: Connection<UserModel> },
      FindPageVariables
    >({
      query: gql`
        query findPage(
          $query: String
          $first: Int
          $after: String
          $last: Int
          $before: String
          $offset: Int
          $sort: [Sort!]!
        ) {
          users(
            query: $query
            first: $query
            after: $after
            last: $last
            before: $before
            offset: $offset
            sort: $sort
          ) {
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
            edges {
              cursor
              node {
                id
                createdAt
                updatedAt

                name
                role
                authIds
              }
            }
          }
        }
      `,
      variables: {
        ...pagination,
        query: query == null ? undefined : JSON.stringify(query),
        first: pagination.after != null ? pagination.size : undefined,
        last:
          pagination.before != null && pagination.after == null
            ? pagination.size
            : undefined,
        sort,
      },
    });
    return {
      ...data.users,
      items: data.users.edges.map(({ cursor, node }) => ({
        cursor,
        data: node,
      })),
    };
  }

  async handle(): Promise<UserModel | null> {
    return Promise.resolve(null);
  }

  async handleAll(): Promise<Array<UserModel | null>> {
    return Promise.resolve([]);
  }
}
