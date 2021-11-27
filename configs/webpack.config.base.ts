import webpack from 'webpack';
import path from 'path';
import process from 'process';
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
      // Native modules can be bundled as well.
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      // Some of MikroORM's dependencies use mjs files, so let's set them up here.
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
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules'),
      allowlist: [/^@white-rabbit\//],
    }),
  ],
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
