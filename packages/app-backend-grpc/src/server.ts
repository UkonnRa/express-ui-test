import fs from "fs";
import path from "path";
import { inject, singleton } from "tsyringe";
import { ServerCredentials } from "@grpc/grpc-js";
import { createServer, Server as GrpcServer } from "nice-grpc";
import {
  ServerReflection,
  ServerReflectionService,
} from "nice-grpc-server-reflection";
import { errorDetailsServerMiddleware } from "nice-grpc-error-details";
import { UserService } from "./service";
import { UserServiceDefinition } from "./proto/user";

@singleton()
export default class Server {
  private readonly server: GrpcServer;

  constructor(@inject(UserService) userService: UserService) {
    this.server = createServer().use(errorDetailsServerMiddleware);
    this.server.add(UserServiceDefinition, userService as any);
    this.server.add(
      ServerReflectionService,
      ServerReflection(
        fs.readFileSync(path.join(process.cwd(), "protoset.bin")),
        [UserServiceDefinition.fullName]
      )
    );
  }

  async start(): Promise<void> {
    const url = `0.0.0.0:${process.env.PORT ?? 80}`;
    await this.server.listen(url, ServerCredentials.createInsecure());
    console.log(`Start server at ${url}`);
  }
}
