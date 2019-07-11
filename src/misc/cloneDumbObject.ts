// tslint:disable-next-line: interface-over-type-literal

export function cloneDumbObject<T>(source: T): T {
  const isDumbObject = Object.values(source).every((value: any) => {
    const type = typeof value;
    return type !== "object" && type !== "function";
  });

  if (!isDumbObject) {
    throw Error("Object cannot contain non-value types.");
  }

  const obj = {};
  Object.assign(obj, source);
  return obj as T;
}
