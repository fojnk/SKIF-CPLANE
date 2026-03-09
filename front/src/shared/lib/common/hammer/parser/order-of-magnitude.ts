/**
 * 4_000_000 -> 1_000_000
 * 6_000_000_000 -> 1_000_000_000
 * 400_000 -> 100_000
 * 1000 -> 1000
 */
export const orderOfMagnitude = (
  value: number,
  cfg?: { max?: number; min?: number },
) => {
  let mod = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Math.floor(value / mod) < 1000) {
      break;
    }

    mod *= 1000;
  }

  if (cfg?.max != null) {
    mod = Math.min(mod, cfg.max);
  }

  if (cfg?.min != null) {
    mod = Math.max(mod, cfg.min);
  }

  return mod;
};
