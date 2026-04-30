# three-wwt

This repository provides a small set of utilities for displaying models generated with
THREE.js inside of WWT.

This is done by creating a THREE.js WebGL renderer whose display state (projection and
view matrices) are synced up with WWT on each render frame. This can be done either by
having THREE draw to the same canvas as WWT, or by drawing to a different canvas with
a transparent background that is overlaid on the WWT canvas.

## Use in Vue

For easy use in Vue, we recommend the following patterns using a watcher.

### Composition API
```typescript
import { ref, watch } from "vue";
import { setupThreeWWT } from "three-wwt";

const threeWWTOptions = { ... };  // Define your options here
const { scene, camera, canvas, renderer, enableRendering } = setupThreeWWT(WWTControl.singleton, threeWWTOptions);

const render = ref(true);
watch(render => enableRendering);
```

### Options API
```typescript
import { setupThreeWWT } from "three-wwt";

export default defineComponent({
  ...
  data: {
    render: true,
    ...
  },
  ...
  watch: {
    render(value: boolean) {
      enableRendering(value);
    },
    ...
  },
  ...
});
```
