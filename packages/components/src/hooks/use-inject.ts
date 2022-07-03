import { inject, InjectionKey } from "vue";

export default function useInject<S>(key: InjectionKey<S>, name?: string): S {
  const service = inject<S>(key);
  if (service == null) {
    throw new Error(
      `${name ?? key} is not available, please inject it when starting`
    );
  }
  return service;
}
