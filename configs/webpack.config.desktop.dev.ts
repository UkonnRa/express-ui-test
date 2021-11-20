import webpack from 'webpack';
import path from 'path';
import process from 'process';
import nodeExternals from 'webpack-node-externals';
import devConfig from './webpack.config.dev';

const config: webpack.Configuration = {
  ...devConfig,
  entry: {
    index: [path.resolve(process.cwd(), './src/index.ts'), 'webpack/hot/poll?100'],
    preload: path.resolve(process.cwd(), './src/preload.ts'),
  },
  output: {
    ...devConfig.output,
    path: path.resolve(process.cwd(), './app/dist'),
    globalObject: 'this',
    filename: '[name].js',
  },
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  plugins: [devConfig.plugins![0]!],
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules'),
      allowlist: ['webpack/hot/poll?100', /^@white-rabbit\//],
    }),
  ],
};

export default config;
