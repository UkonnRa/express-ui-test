/* eslint-disable @typescript-eslint/no-explicit-any */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
