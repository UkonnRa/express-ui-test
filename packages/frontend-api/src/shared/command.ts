export default interface Command {
  readonly type: string;
  readonly targetId?: string;
}
