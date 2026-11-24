declare module 'js-aruco2' {
  export const AR: {
    Detector: new (config?: { dictionaryName?: string; maxHammingDistance?: number }) => {
      detect(frame: ImageData): { id: number }[];
    };
    Dictionary: new (name: string) => { generateSVG(id: number): string };
  };
}
