import { inject, singleton } from "tsyringe";
import { ServerCredentials, Server as GrpcServer } from "@grpc/grpc-js";
import { adaptService } from "@protobuf-ts/grpc-backend";
import {
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

@singleton()
export default class Server {
  private readonly server: GrpcServer;

  constructor(
    @inject(UserService) userService: UserService,
    @inject(GroupService) groupService: GroupService,
    @inject(JournalService) journalService: JournalService,
    @inject(AccountService) accountService: AccountService,
    @inject(RecordService) recordService: RecordService
  ) {
    this.server = new GrpcServer();
    this.server.addService(...adaptService(UserServiceDef, userService));
    this.server.addService(...adaptService(GroupServiceDef, groupService));
    this.server.addService(...adaptService(JournalServiceDef, journalService));
    this.server.addService(...adaptService(AccountServiceDef, accountService));
    this.server.addService(...adaptService(RecordServiceDef, recordService));
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
