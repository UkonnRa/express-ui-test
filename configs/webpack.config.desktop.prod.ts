import webpack from 'webpack';
import path from 'path';
import process from 'process';
import desktopDevConfig from './webpack.config.desktop.dev';
import prodConfig from './webpack.config.prod';

export default {
  ...prodConfig,
  entry: {
    index: path.resolve(process.cwd(), './src/index.ts'),
    preload: path.resolve(process.cwd(), './src/preload.ts'),
  },
  output: desktopDevConfig.output,
} as webpack.Configuration;
