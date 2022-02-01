import { Options } from '@mikro-orm/core/utils';
import { MikroORM } from '@mikro-orm/core';
import winston from 'winston';
import { container } from 'tsyringe';
import { Account, FinRecord } from './domains/fin-record';
import { AccessItem, AccessItemGroup, AccessItemUser, AccessList, Journal } from './domains/journal';
import { User } from './domains/user';
import { Group } from './domains/group';

const entities = [Account, FinRecord, Group, Journal, AccessList, AccessItem, AccessItemUser, AccessItemGroup, User];

export const defineOrmConfig = (options: Options) => ({
  ...options,
  entities,
  discovery: { disableDynamicFileAccess: true },
  debug: process.env.NODE_ENV !== 'production',
});

export const initService = async (options: Options) => {
  const orm = await MikroORM.init(defineOrmConfig(options));
  const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });

  container.register(MikroORM, { useValue: orm });
  container.register('Logger', { useValue: logger });
};
