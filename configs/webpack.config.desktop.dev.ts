import webpack from 'webpack';
import path from 'path';
import process from 'process';
import devConfig from './webpack.config.dev';

const config: webpack.Configuration = {
  ...devConfig,
  entry: {
    index: [path.resolve(process.cwd(), './src/index.ts'), 'webpack/hot/poll?100'],
    preload: path.resolve(process.cwd(), './src/preload.ts'),
  },
  output: {
    ...devConfig.output,
    globalObject: 'this',
    filename: '[name].js',
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

export default config;
