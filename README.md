# three-wwt

This repository provides a small set of utilities for displaying models generated with
THREE.js inside of WWT.

This is done by creating a THREE.js WebGL renderer whose display state (projection and
view matrices) are synced up with WWT on each render frame. This can be done either by
having THREE draw to the same canvas as WWT, or by drawing to a different canvas with
a transparent background that is overlaid on the WWT canvas.
