/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_TYPE: "local" | "graphql" | "jsonapi" | "grpc" | "mock";
  readonly VITE_API_URL: string;
  readonly VITE_OPENID_DISCOVERY_URL: string;
  readonly VITE_OPENID_APP_ID: string;
  readonly VITE_OPENID_APP_SECRET: string;
  readonly VITE_OPENID_CALLBACK_URL: string;
  readonly VITE_OPENID_USERNAME: string;
  readonly VITE_OPENID_PASSWORD: string;
  // more env variables...
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
