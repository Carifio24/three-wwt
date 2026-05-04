import { WWTControl } from "@wwtelescope/engine";
import { createDummyCanvas, createTHREECamera, createTHREERenderer, createTHREEScene, updateTHREECamera, renderTHREE } from "./utils";

import type { Camera, Scene, WebGLRenderer } from "three";

export interface UseTHREEOptions {
  useWWTCanvas?: boolean;
  render?: boolean;
  far?: number;
}

export interface ThreeWWTSetup {
  camera: Camera;
  renderer: WebGLRenderer;
  scene: Scene;
  canvas: HTMLCanvasElement;
  resizeObserver: ResizeObserver | null;
  enableRendering: (enable: boolean) => void;
}

export function setupThreeWWT(control: WWTControl, options?: UseTHREEOptions): ThreeWWTSetup  {
  const scene = createTHREEScene();
  const camera = createTHREECamera(control.renderContext, options?.far ?? 1);

  const useWWTCanvas = options?.useWWTCanvas ?? false;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `WWTControl` does have a `canvas` member
  const wwtCanvas: HTMLCanvasElement = control.canvas;
  let canvas = wwtCanvas;
  let resizeObserver: ResizeObserver | null = null;
  if (!useWWTCanvas) {
    [canvas, resizeObserver] = createDummyCanvas(wwtCanvas);
  }

  const renderer = createTHREERenderer(control, canvas);
  renderer.autoClear = !options?.useWWTCanvas;

  let render = options?.render ?? true;

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
    resizeObserver,
  };
}
