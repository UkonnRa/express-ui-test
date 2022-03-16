# white-rabbit

## Target Build Workflow

* Each project should the same build scripts
  * This kind of scripts should include:
    * **build**: for apps
      * [x] The built materials should be **bundled** and **minified**
      * [x] The native `.node` dependencies could only be installed via npm
        * ~~Maybe [esbuild could solve it](https://github.com/evanw/esbuild/issues/1051#issuecomment-806325487) by hacking~~
        * ~~Of course [Webpack Node Loader](https://webpack.js.org/loaders/node-loader/) can solve this~~
        * Finally, the best options may install native modules when deploying (say in Docker)
      * [x] Should run recursively, only all the dependencies finished can the current project run `build`
      * [x] Projects can be fetched via [Path Re-Mapping](https://www.typescriptlang.org/tsconfig#paths)
    * [x] **lint** and **lint:fix**: for linting and checking the code quality, including type checking for vue
    * [x] **dev**: for apps
      * [x] Only apps can have the script `dev`
      * [x] **Hot Reloading with dependencies** should be enabled in dev mode
    * **test**:
      * [x] Should run in parallel, which means neither of the two tests would be influenced, specifically about reading/writing database
      * [x] `lcov` files should be generated, including unit ~~and e2e tests~~
        * E2E tests are not suitable for generating lcov related tests, since they are black box tests
      * About coverage tools supporting on Monorepo:
        * [ ] SonarCloud support Monorepo by [mapping a repository to multiple Sonar projects](https://docs.sonarcloud.io/advanced-setup/monorepo-support/)
        * [ ] Codecov support Monorepo by [splitting the reports to different parts using Flags feature](https://docs.codecov.com/docs/flags)
