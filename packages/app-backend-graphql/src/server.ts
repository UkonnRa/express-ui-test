import path from "path";
import { inject, singleton } from "tsyringe";
import { ApolloServer } from "apollo-server";
import { loadFilesSync } from "@graphql-tools/load-files";
import { QueryResolver, GroupResolver } from "./resolver";

@singleton()
export default class Server {
  private readonly server: ApolloServer;

  constructor(
    @inject(QueryResolver) queryResolver: QueryResolver,
    @inject(GroupResolver) groupResolver: GroupResolver
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
        },
        User: {
          createdAt: (source) => source.createdAt.toISOString(),
          updatedAt: (source) => source.updatedAt.toISOString(),
          deletedAt: (source) => source.deletedAt?.toISOString(),
        },
        Group: {
          createdAt: (source) => source.createdAt.toISOString(),
          updatedAt: (source) => source.updatedAt.toISOString(),
          deletedAt: (source) => source.deletedAt?.toISOString(),

          admins: async (source, args, context) =>
            groupResolver.admins(source, args, context),
          members: async (source, args, context) =>
            groupResolver.members(source, args, context),
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
