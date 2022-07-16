import { inject, singleton } from "tsyringe";
import { Server as GrpcServer, ServerCredentials } from "@grpc/grpc-js";
import { adaptService } from "@protobuf-ts/grpc-backend";
import { CompressionAlgorithms } from "@grpc/grpc-js/build/src/compression-algorithms";
import {
  AccessItemService,
  AccountService,
  GroupService,
  JournalService,
  RecordService,
  UserService,
} from "./service";
import { UserService as UserServiceDef } from "./proto/user";
import { GroupService as GroupServiceDef } from "./proto/group";
import { JournalService as JournalServiceDef } from "./proto/journal";
import { AccountService as AccountServiceDef } from "./proto/account";
import { RecordService as RecordServiceDef } from "./proto/record";
import { AccessItemService as AccessItemServiceDef } from "./proto/access-item";

@singleton()
export default class Server {
  private readonly server: GrpcServer;

  constructor(
    @inject(UserService) userService: UserService,
    @inject(GroupService) groupService: GroupService,
    @inject(JournalService) journalService: JournalService,
    @inject(AccountService) accountService: AccountService,
    @inject(RecordService) recordService: RecordService,
    @inject(AccessItemService) accessItemService: AccessItemService
  ) {
    // https://github.com/grpc/grpc-web/blob/master/doc/browser-features.md#compression
    this.server = new GrpcServer({
      "grpc.default_compression_algorithm": CompressionAlgorithms.gzip,
      "grpc.default_compression_level": 3,
    });
    this.server.addService(...adaptService(UserServiceDef, userService));
    this.server.addService(...adaptService(GroupServiceDef, groupService));
    this.server.addService(...adaptService(JournalServiceDef, journalService));
    this.server.addService(...adaptService(AccountServiceDef, accountService));
    this.server.addService(...adaptService(RecordServiceDef, recordService));
    this.server.addService(
      ...adaptService(AccessItemServiceDef, accessItemService)
    );
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
