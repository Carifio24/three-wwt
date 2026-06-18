import { ScriptInterface, WWTControl } from "@wwtelescope/engine";
import { createDummyCanvas, createTHREECamera, createTHREERenderer, createTHREEScene, updateTHREECamera, renderTHREE, setThree } from "./utils";

import * as THREE from "three";


export interface BaseUseThreeOptions {
  three: typeof THREE;
  render?: boolean;
  far?: number;
  ambientLight?: boolean;
}

export interface WWTConnectionOptions {
  control?: WWTControl;
  scriptInterface?: ScriptInterface;
}

interface BasicRenderTargetOptions {
  target?: "wwt" | "overlay";
  canvas?: never;
}

interface CustomRenderTargetOptions {
  target: "custom";
  canvas: HTMLCanvasElement;
}

export type RenderTargetOptions = BasicRenderTargetOptions | CustomRenderTargetOptions;
export type UseThreeOptions = BaseUseThreeOptions & RenderTargetOptions & WWTConnectionOptions;

export interface ThreeWWTSetup {
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  resizeObserver: ResizeObserver | null;
  enableRendering: (enable: boolean) => void;
  disconnect: () => void;
}

export function setupThreeWWT(options: UseThreeOptions): ThreeWWTSetup  {
  setThree(options.three);

  const control = options.control ?? WWTControl.singleton;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `WWTControl` does have a `scriptInterface` member
  const scriptInterface = options.scriptInterface ?? WWTControl.scriptInterface as ScriptInterface;

  const scene = createTHREEScene(options?.ambientLight ?? true);
  const camera = createTHREECamera(control.renderContext, options.far ?? 1);

  if (options.target === "custom" && options.canvas == undefined) {
    throw new Error("You must provide a canvas element when using a custom render target");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `WWTControl` does have a `canvas` member
  const wwtCanvas: HTMLCanvasElement = control.canvas;

  let canvas = wwtCanvas;
  let resizeObserver: ResizeObserver | null = null;
  switch (options.target) {
  case "custom":
    canvas = options.canvas;
    break;
  case "overlay":
    [canvas, resizeObserver] = createDummyCanvas(canvas);
    break;
  }

  const renderTarget = options.target ?? "wwt";
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

  function frameCallback(_si: ScriptInterface) {
    if (render) {
      updateTHREECamera(camera, control.renderContext);
      renderTHREEBlock(); 
    }
  }

  scriptInterface.add_on_frame(frameCallback);

  function disconnect() {
    scriptInterface.remove_on_frame(frameCallback);
  }

  return {
    scene,
    camera,
    canvas,
    renderer,
    enableRendering,
    resizeObserver,
    disconnect,
  };
}
