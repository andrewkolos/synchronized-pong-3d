// tslint:disable-next-line: interface-over-type-literal

export function cloneDumbObject<T>(source: T): T {
  if (!isDumbObject(source)) {
    throw Error('Object cannot contain non-value types.');
  }

  return JSON.parse(JSON.stringify(source));
}

function isDumbObject(o: any): boolean {
  return Object.values(o).every((value: any) => {
    const type = typeof value;
    if (type === 'object') {
      return isDumbObject(value);
    }
    return type !== 'function';
  });
}
