import { WWTControl } from "@wwtelescope/engine";
import { createDummyCanvas, createTHREECamera, createTHREERenderer, createTHREEScene, updateTHREECamera, renderTHREE } from "./utils";

import type { Camera, Scene, WebGLRenderer } from "three";

interface BaseUseThreeOptions {
  render?: boolean;
  far?: number;
}

interface BasicRenderTargetOptions extends BaseUseThreeOptions {
  target: "wwt" | "overlay";
  canvas?: never;
}

interface CustomRenderTargetOptions extends BaseUseThreeOptions {
  target: "custom";
  canvas: HTMLCanvasElement;
}

export type UseThreeOptions = BasicRenderTargetOptions | CustomRenderTargetOptions;

export interface ThreeWWTSetup {
  camera: Camera;
  renderer: WebGLRenderer;
  scene: Scene;
  canvas: HTMLCanvasElement;
  resizeObserver: ResizeObserver | null;
  enableRendering: (enable: boolean) => void;
}

export function setupThreeWWT(control: WWTControl, options?: UseThreeOptions): ThreeWWTSetup  {
  const opts: UseThreeOptions = options ?? { target: "wwt" };
  const scene = createTHREEScene();
  const camera = createTHREECamera(control.renderContext, opts.far ?? 1);

  const renderTarget = opts.target ?? "wwt";

  if (renderTarget === "custom" && opts.canvas == undefined) {
    throw new Error("You must provide a canvas element when using a custom render target");
  }
  //
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `WWTControl` does have a `canvas` member
  const wwtCanvas: HTMLCanvasElement = control.canvas;

  let canvas = wwtCanvas;
  let resizeObserver: ResizeObserver | null = null;
  if (opts) {
    switch (opts.target) {
    case "custom":
      canvas = opts.canvas;
      break;
    case "overlay":
      [canvas, resizeObserver] = createDummyCanvas(canvas);
      break;
    }
  }

  const renderer = createTHREERenderer(control, canvas);
  renderer.autoClear = renderTarget !== "wwt";

  let render = options?.render ?? true;

  function enableRendering(enable: boolean) {
    render = enable;
    if (!render) {
      renderer.clear();
    }
  }

  let renderTHREEBlock: CallableFunction;
  if (renderTarget == "wwt") {
    renderTHREEBlock = function() {
      renderer.resetState();
      renderTHREE(renderer, scene, camera);
      renderer.resetState();
    };
  } else {
    renderTHREEBlock = renderTHREE;
  }


  const renderOneFrame = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
  WWTControl.singleton.renderOneFrame();
  WWTControl.singleton.renderOneFrame = function () {
    renderOneFrame();
    if (render) {
      updateTHREECamera(camera, control.renderContext);
      renderTHREEBlock(); 
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
