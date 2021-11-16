import webpack from 'webpack';
import path from 'path';
import * as process from 'process';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

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
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules'),
      allowlist: /^@white-rabbit\//,
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // We want to minify the bundle, but don't want Terser to change the names of our entity
          // classes. This can be controlled in a more granular way if needed, (see
          // https://terser.org/docs/api-reference.html#mangle-options) but the safest default
          // config is that we simply disable mangling altogether but allow minification to proceed.
          mangle: false,
          // Similarly, Terser's compression may at its own discretion change function and class names.
          // While it only rarely does so, it's safest to also disable changing their names here.
          // This can be controlled in a more granular way if needed (see
          // https://terser.org/docs/api-reference.html#compress-options).
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
