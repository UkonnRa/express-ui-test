import { Options } from '@mikro-orm/core/utils';
import { MikroORM } from '@mikro-orm/core';
import { container } from 'tsyringe';

const entities: never[] = [];

export const defineOrmConfig = (options: Options) => ({
  ...options,
  entities,
  discovery: { disableDynamicFileAccess: true },
  debug: process.env.NODE_ENV !== 'production',
});

export const initService = async (options: Options) => {
  const orm = await MikroORM.init(defineOrmConfig(options));
  container.register(MikroORM, { useValue: orm });
};
