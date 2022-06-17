import { inject, singleton } from "tsyringe";
import { ServerCredentials, Server as GrpcServer } from "@grpc/grpc-js";
import { adaptService } from "@protobuf-ts/grpc-backend";
import { GroupService, UserService } from "./service";
import {
  UserService as UserServiceDef,
  GroupService as GroupServiceDef,
} from "./proto/app";

@singleton()
export default class Server {
  private readonly server: GrpcServer;

  constructor(
    @inject(UserService) userService: UserService,
    @inject(GroupService) groupService: GroupService
  ) {
    this.server = new GrpcServer();
    this.server.addService(...adaptService(UserServiceDef, userService));
    this.server.addService(...adaptService(GroupServiceDef, groupService));
  }

  async start(): Promise<void> {
    const url = `0.0.0.0:${process.env.PORT ?? 80}`;
    this.server.bindAsync(
      url,
      ServerCredentials.createInsecure(),
      (err: Error | null, port: number) => {
        if (err != null) {
          console.error(`Server error: ${err.message}`);
        } else {
          console.log(`Server bound on port: ${port}`);
          this.server.start();
        }
      }
    );
  }
}
