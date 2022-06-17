import { App } from "vue";
import type { UserApi } from "@white-rabbit/frontend-api";
import { container } from "tsyringe";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { UserGraphqlApi } from "@white-rabbit/frontend-api-graphql";

type Api = { user: UserApi };

const SYMBOL_API = Symbol("API");

export { type Api, SYMBOL_API };

export default function (app: App): void {
  if (import.meta.env.VITE_API_TYPE === "graphql") {
    const client = new ApolloClient({
      link: ApolloLink.from([
        onError(({ graphQLErrors, networkError }) => {
          if (graphQLErrors)
            graphQLErrors.forEach(({ message, locations, path }) =>
              console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
              )
            );
          if (networkError) console.log(`[Network error]: ${networkError}`);
        }),
        new HttpLink({
          uri: import.meta.env.VITE_API_URL,
          credentials: "same-origin",
        }),
      ]),
      cache: new InMemoryCache(),
    });
    container.registerInstance(ApolloClient, client);
    app.provide<Api>(SYMBOL_API, {
      user: container.resolve(UserGraphqlApi),
    });
  } else if (import.meta.env.VITE_API_TYPE === "mock") {
    app.provide<Api>(SYMBOL_API, {
      user: {
        findOne: async () => null,
        findPage: async () => ({
          pageInfo: { hasPreviousPage: false, hasNextPage: false },
          items: [],
        }),
      },
    });
  } else {
    throw new Error(
      `Invalid environment variable VITE_API_TYPE: ${
        import.meta.env.VITE_API_TYPE
      }`
    );
  }
}
