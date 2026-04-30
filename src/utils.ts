import { Matrix3d, RenderContext, WWTControl } from "@wwtelescope/engine";
import { ACESFilmicToneMapping, Camera, Matrix4, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three";


function matchDimensions(source: HTMLCanvasElement, target: HTMLCanvasElement) {
  target.style.width = source.style.width;
  target.style.height = source.style.height;
  target.height = source.height;
  target.width = source.width;
}

export function createDummyCanvas(canvas: HTMLCanvasElement, opacity=0): HTMLCanvasElement {
  const dummy = document.createElement("canvas");
  matchDimensions(canvas, dummy);
  dummy.id = "three-js-canvas";
  dummy.style.position = "absolute";
  dummy.style.left = "0";
  dummy.style.top = "0";
  dummy.style.background = `rgba(0, 0, 0, ${opacity})`;
  dummy.style.pointerEvents = "none";

  const observer = new ResizeObserver(_entries => {
    matchDimensions(canvas, dummy);
  });
  observer.observe(canvas);

  return dummy;
}

export function createTHREECamera(renderContext: RenderContext, far=1): PerspectiveCamera {
  const camera = new PerspectiveCamera(75, renderContext.width / renderContext.height, renderContext.nearPlane, far);
  camera.matrixAutoUpdate = false;
  return camera;
}

export function createTHREEScene(): Scene {
  return new Scene();
}

export function createTHREERenderer(control: WWTControl, canvas: HTMLCanvasElement): WebGLRenderer {
  const wwtCanvas: HTMLCanvasElement = control.canvas;
  const context = canvas.getContext("webgl2")!;
  const renderer = new WebGLRenderer({
    canvas,
    context,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(wwtCanvas.width / wwtCanvas.clientWidth);
  renderer.setClearColor(0x000000, 0);

  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;

  return renderer;
}

export function wwtMatrixToTHREE(mat: Matrix3d): Matrix4 {
  const matrix = new Matrix4();
  matrix.set(
    mat.get_m11(), mat.get_m21(), mat.get_m31(), mat.get_m41(),
    mat.get_m12(), mat.get_m22(), mat.get_m32(), mat.get_m42(),
    mat.get_m13(), mat.get_m23(), mat.get_m33(), mat.get_m43(),
    mat.get_m14(), mat.get_m24(), mat.get_m34(), mat.get_m44(),
  );
  return matrix;
}

export function updateTHREECamera(camera: PerspectiveCamera, renderContext: RenderContext) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `get_projection` exists
  camera.projectionMatrix.copy(wwtMatrixToTHREE(renderContext.get_projection()));
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error `get_view` exists
  camera.matrixWorldInverse.copy(wwtMatrixToTHREE(renderContext.get_view()));
  camera.matrixWorld.copy(camera.matrixWorldInverse).invert();
  camera.matrixWorldNeedsUpdate = false;
}

export function renderTHREE(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  renderer.render(scene, camera);
}
