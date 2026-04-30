import { WWTControl } from "@wwtelescope/engine";
import { createDummyCanvas, createTHREECamera, createTHREERenderer, createTHREEScene, updateTHREECamera, renderTHREE } from "./utils";

export interface UseTHREEOptions {
  useWWTCanvas?: boolean;
  render?: boolean;
  far?: number;
}


export function setupThreeWWT(control: WWTControl, options: UseTHREEOptions) {
  const scene = createTHREEScene();
  const camera = createTHREECamera(control.renderContext, options.far ?? 1);

  const useWWTCanvas = options.useWWTCanvas ?? false;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `WWTControl` does have a `canvas` member
  const canvas = useWWTCanvas ? control.canvas : createDummyCanvas(control.canvas);
  const renderer = createTHREERenderer(control, canvas);
  renderer.autoClear = !options.useWWTCanvas;

  let render = options.render ?? true;

  function enableRendering(enable: boolean) {
    render = enable;
    if (!render) {
      renderer.clear();
    }
  }

  const renderOneFrame = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
  WWTControl.singleton.renderOneFrame();
  WWTControl.singleton.renderOneFrame = function () {
    renderOneFrame();
    if (render) {
      updateTHREECamera(camera, control.renderContext);
      if (useWWTCanvas) {
        renderer.resetState();
        renderTHREE(renderer, scene, camera);
        renderer.resetState();
      } else {
        renderTHREE(renderer, scene, camera);
      }
    }
  }.bind(WWTControl.singleton);

  return {
    scene,
    camera,
    canvas,
    renderer,
    enableRendering,
  };
}
