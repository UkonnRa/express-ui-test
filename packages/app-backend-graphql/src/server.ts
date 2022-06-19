import path from "path";
import { inject, singleton } from "tsyringe";
import { ApolloServer } from "apollo-server";
import { loadFilesSync } from "@graphql-tools/load-files";
import {
  QueryResolver,
  GroupResolver,
  AccessItemResolver,
  JournalResolver,
} from "./resolver";

@singleton()
export default class Server {
  private readonly server: ApolloServer;

  constructor(
    @inject(QueryResolver) queryResolver: QueryResolver,
    @inject(GroupResolver) groupResolver: GroupResolver,
    @inject(JournalResolver) journalResolver: JournalResolver,
    @inject(AccessItemResolver) accessItemResolver: AccessItemResolver
  ) {
    this.server = new ApolloServer({
      cache: "bounded",
      typeDefs: loadFilesSync(path.join(process.cwd(), "schema/*.graphql")),
      resolvers: {
        Query: {
          users: async (source, args, context) =>
            queryResolver.users(source, args, context),
          user: async (source, args, context) =>
            queryResolver.user(source, args, context),
          groups: async (source, args, context) =>
            queryResolver.groups(source, args, context),
          group: async (source, args, context) =>
            queryResolver.group(source, args, context),
          journals: async (source, args, context) =>
            queryResolver.journals(source, args, context),
          journal: async (source, args, context) =>
            queryResolver.journal(source, args, context),
        },
        User: {
          createdAt: (source) => source.createdAt.toISOString(),
          updatedAt: (source) => source.updatedAt.toISOString(),
        },
        Group: {
          createdAt: (source) => source.createdAt.toISOString(),
          updatedAt: (source) => source.updatedAt.toISOString(),

          admins: async (source, args, context) =>
            groupResolver.admins(source, args, context),
          members: async (source, args, context) =>
            groupResolver.members(source, args, context),
        },
        Journal: {
          createdAt: (source) => source.createdAt.toISOString(),
          updatedAt: (source) => source.updatedAt.toISOString(),

          admins: async (source, args, context) =>
            journalResolver.admins(source, args, context),
          members: async (source, args, context) =>
            journalResolver.members(source, args, context),
        },
        AccessItem: {
          __resolveType: accessItemResolver.__resolveType,
        },
        AccessItemUser: {
          user: async (source, args, context) =>
            accessItemResolver.user(source, args, context),
        },
        AccessItemGroup: {
          group: async (source, args, context) =>
            accessItemResolver.group(source, args, context),
        },
      },
      csrfPrevention: true,
    });
  }

  async start(): Promise<void> {
    const { url } = await this.server.listen({ port: process.env.PORT });
    console.log(`WhiteRabbit GraphQL server ready at ${url}`);
  }
}
