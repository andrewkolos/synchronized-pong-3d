type Source = null | Number | Array<Array<unknown>> | AudioBuffer | HTMLAudioElement | 
              Object | Array<Number> | Float32Array | Float64Array | Int8Array | Uint8Array |
              ArrayBuffer | Buffer | string;

type Options = Partial<{
  length: number;
  context: AudioContext;
  channels: number;
  numberOfChannels: number;
  sampleRate: number;
  rate: number;
  format: unknown;
}>;

declare module "audio-buffer-from" {
  function createBuffer(source: Source | number, options?: Options): AudioBuffer;

  export default createBuffer;
}