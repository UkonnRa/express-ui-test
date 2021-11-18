import webpack from 'webpack';
import path from 'path';
import * as process from 'process';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

const config: webpack.Configuration = {
  target: 'node',
  entry: path.resolve(process.cwd(), './src/index.ts'),
  module: {
    rules: [
      {
        test: /.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    path: path.resolve(process.cwd(), './dist'),
    libraryTarget: 'commonjs',
    filename: 'index.js',
  },
  externalsPresets: {
    node: true,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: {
            keep_classnames: true,
            keep_fnames: true,
          },
        },
      }),
    ],
  },
};

export default config;
