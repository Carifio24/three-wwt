import { engineStore } from "@wwtelescope/engine-pinia";
import type { WWTInstance } from "@wwtelescope/engine-helpers";
import { setupThreeWWT, type BaseUseThreeOptions, type RenderTargetOptions, type ThreeWWTSetup } from "./setupThreeWWT";

type WWTEngineStore = ReturnType<typeof engineStore>;

type ThreeWWTStoreSetupOptions = BaseUseThreeOptions & RenderTargetOptions;

export function setupFromStore(store: WWTEngineStore, options: ThreeWWTStoreSetupOptions): ThreeWWTSetup {
  // eslint-disable-next-line @typescript-eslint
  // @ts-expect-error `store.$wwt.inst` does exist and is a `WWTInstance`
  const wwtInstance = store.$wwt.inst as WWTInstance;
  return setupThreeWWT({
    ...options,
    control: wwtInstance.ctl,
    scriptInterface: wwtInstance.si,
  });
}
