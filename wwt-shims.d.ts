import "@wwtelescope/engine";


declare module "@wwtelescope/engine" {
    
export namespace TileCache {
  let _tiles: Record<string, Tile>;
  export function getTile(level: number, x: number, y: number, dataset: Imageset, parent: null): Tile | undefined;
  export function clearCache(): void;
  export function decimateQueue(): void;
  export function processQueue(renderContext: RenderContext);
  export function removeFromQueue(key: string, complete: boolean): void;
}

export namespace RenderContext {
  export function getTilesXForLevel(imageset: Imageset, level: number): number;
  export function getTilesYForLevel(imageset: Imageset, level: number): number;
}

interface Tile {
    dataset?: Imageset;
    _key: string;
    cleanUp(complete: boolean): void;
  }

}