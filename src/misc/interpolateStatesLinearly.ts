
export function interpolateStatesLinearly<T extends any>(state1: T, state2: T, timeRatio: number): T {
  const newState: any = {};

  Object.keys(state1).forEach((key: string) => {
    if (typeof state1[key] === "number") {
      newState[key] = state1[key] + (state2[key] - state1[key]) * timeRatio;
    } else if (typeof state1[key] === "object") {
      newState[key] = interpolateStatesLinearly(state1[key], state2[key], timeRatio);
    } else {
      throw Error(`Cannot interpolate non-number / non-number object property '${key}'.`);
    }
  });

  return newState;
}