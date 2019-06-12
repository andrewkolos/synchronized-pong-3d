import Three from 'three';

export type DeepReadonly<T> =
  T extends (infer R)[] ? DeepReadonlyArray<R> :
  T extends Function ? T :
  T extends object ? DeepReadonlyObject<T> :
  T;

export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> { }

export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export function makeTextureFromBase64Image(data: string) {
  const image = new Image();
  image.src = data;
  const texture = new Three.Texture();
  texture.image = image;
  image.onload= function() {
    texture.needsUpdate = true;
  }

  return texture;
}