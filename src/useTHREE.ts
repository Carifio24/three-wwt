import { ref, watch } from "vue";
import { WWTControl } from "@wwtelescope/engine";
import { createDummyCanvas, createTHREECamera, createTHREERenderer, createTHREEScene, updateTHREECamera, renderTHREE } from "./utils";
import { GLStateSnapshot } from "./glSnapshot";

export interface UseTHREEOptions {
  useWWTCanvas?: boolean;
  render?: boolean;
  far?: number;
}


export function useTHREE(control: WWTControl, options: UseTHREEOptions) {
  const scene = createTHREEScene();
  const camera = createTHREECamera(control.renderContext, options.far ?? 1);

  const useWWTCanvas = options.useWWTCanvas ?? false;
  const canvas = useWWTCanvas ? control.canvas : createDummyCanvas(control.canvas);
  const renderer = createTHREERenderer(control, canvas);
  renderer.autoClear = !options.useWWTCanvas;

  const render = ref(options.render ?? true);
  const snapshot = new GLStateSnapshot(canvas.getContext("webgl2")!);

  const renderOneFrame = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
  WWTControl.singleton.renderOneFrame();
  WWTControl.singleton.renderOneFrame = function () {
    renderOneFrame();
    if (render.value) {
      updateTHREECamera(camera, control.renderContext);
      if (useWWTCanvas) {
        // snapshot.capture();
        renderer.resetState();
        renderTHREE(renderer, scene, camera);
        renderer.resetState();
        // snapshot.restore();
      } else {
        renderTHREE(renderer, scene, camera);
      }
    }
  }.bind(WWTControl.singleton);

  watch(render, (shouldRender: boolean) => {
    if (!shouldRender) {
      renderer.clear();
    }
  });

  return {
    scene,
    camera,
    canvas,
    renderer,
    render,
  };
}
