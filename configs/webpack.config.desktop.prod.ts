import webpack from 'webpack';
import prodConfig from './webpack.config.prod';
import desktopDevConfig from './webpack.config.desktop.dev';
import path from 'path';
import process from 'process';

const config: webpack.Configuration = {
  ...prodConfig,
  entry: {
    index: path.resolve(process.cwd(), './src/index.ts'),
    preload: path.resolve(process.cwd(), './src/preload.ts'),
  },
  output: desktopDevConfig.output,
};
export default config;
