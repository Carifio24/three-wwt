
import { FrameCallback, ScriptInterface, WWTControl, globalScriptInterface } from "@wwtelescope/engine";
import { createDummyCanvas, createTHREECamera, createTHREERenderer, createTHREEScene, updateTHREECamera, renderTHREE, setThree } from "./utils";

import * as THREE from "three";


interface BaseUseThreeOptions {
  three: typeof THREE;
  control?: WWTControl;
  scriptInterface?: ScriptInterface;
  render?: boolean;
  far?: number;
  ambientLight?: boolean;
}

interface BasicRenderTargetOptions extends BaseUseThreeOptions {
  target?: "wwt" | "overlay";
  canvas?: never;
}

interface CustomRenderTargetOptions extends BaseUseThreeOptions {
  target: "custom";
  canvas: HTMLCanvasElement;
}

export type UseThreeOptions = BasicRenderTargetOptions | CustomRenderTargetOptions;

export interface ThreeWWTSetup {
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  resizeObserver: ResizeObserver | null;
  enableRendering: (enable: boolean) => void;
  frameCallback: FrameCallback;
}

export function setupThreeWWT(options: UseThreeOptions): ThreeWWTSetup  {
  setThree(options.three);

  const control = options.control ?? WWTControl.singleton;
  const scriptInterface = options.scriptInterface ?? globalScriptInterface;

  const scene = createTHREEScene(options?.ambientLight ?? true);
  const camera = createTHREECamera(control.renderContext, options.far ?? 1);

  const renderTarget = options.target ?? "wwt";

  if (renderTarget === "custom" && options.canvas == undefined) {
    throw new Error("You must provide a canvas element when using a custom render target");
  }
  //
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `WWTControl` does have a `canvas` member
  const wwtCanvas: HTMLCanvasElement = control.canvas;

  let canvas = wwtCanvas;
  let resizeObserver: ResizeObserver | null = null;
  switch (renderTarget) {
  case "custom":
    canvas = (options as CustomRenderTargetOptions).canvas;
    break;
  case "overlay":
    [canvas, resizeObserver] = createDummyCanvas(canvas);
    break;
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

  function frameCallback(_si: ScriptInterface) {
    if (render) {
      updateTHREECamera(camera, control.renderContext);
      renderTHREEBlock(); 
    }
  }

  scriptInterface.add_on_frame(frameCallback);

  return {
    scene,
    camera,
    canvas,
    renderer,
    enableRendering,
    resizeObserver,
    frameCallback,
  };
}
