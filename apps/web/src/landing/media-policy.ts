export function shouldLoadVideo(options: {
  reducedMotion: boolean | null; saveData: boolean; requested: boolean;
  paused: boolean; failed: boolean; near: boolean;
}): boolean {
  if (options.failed) return false;
  if (options.requested) return true;
  return options.reducedMotion === false && !options.saveData && !options.paused && options.near;
}
