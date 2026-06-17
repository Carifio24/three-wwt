import { engineStore } from "@wwtelescope/engine-pinia";
import { setupThreeWWT, type BaseUseThreeOptions, type RenderTargetOptions, type ThreeWWTSetup, type WWTConnectionOptions } from "./setupThreeWWT";

type WWTEngineStore = ReturnType<typeof engineStore>;

type ThreeWWTStoreSetupOptions = BaseUseThreeOptions & RenderTargetOptions;

export function setupFromStore(store: WWTEngineStore, options: ThreeWWTStoreSetupOptions): ThreeWWTSetup {
  return setupThreeWWT({
    ...options,
    control: store.$wwt.inst.ctl,
    scriptInterface: store.$wwt.inst.si,
  });
}
