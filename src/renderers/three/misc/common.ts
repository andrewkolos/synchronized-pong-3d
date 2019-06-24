import * as Three from "three";

export function createPlane(width: number, height: number, color: number) {
  const geometry = new Three.PlaneGeometry(width, height, 12, 12);
  const material = new Three.MeshBasicMaterial({ color });
  const mesh = new Three.Mesh(geometry, material);
  return mesh;
}

export function getWidthOfObject(object: Three.Object3D) {
  const bounds = new Three.Box3().setFromObject(object);
  return bounds.max.x - bounds.min.x;
}

export function makeTextureFromBase64Image(data: string) {
  const image = new Image();
  image.src = data;
  const texture = new Three.Texture();
  texture.image = image;
  image.onload = () => {
    texture.needsUpdate = true;
  };
  return texture;
}

export function vec3FromVec2(from: Three.Vector2) {
  return new Three.Vector3(from.x, from.y);
}
