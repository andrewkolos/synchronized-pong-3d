export function compareDumbObjects<T>(o1: T, o2: T) {
  const isDumbObject = Object.values(o1).every((value: any) => {
    const type = typeof value;
    return type !== "object" && type !== "function";
  });

  if (!isDumbObject) {
    throw Error("Object cannot contain non-value types.");
  }

  return JSON.stringify(o1) === JSON.stringify(o2);
}
