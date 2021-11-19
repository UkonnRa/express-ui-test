import webpack from 'webpack';
import path from 'path';
import process from 'process';
import desktopDevConfig from './webpack.config.desktop.dev';

const config: webpack.Configuration = {
  ...desktopDevConfig,
  mode: 'production',
  entry: {
    index: path.resolve(process.cwd(), './src/index.ts'),
    preload: path.resolve(process.cwd(), './src/preload.ts'),
  },
};
export default config;
