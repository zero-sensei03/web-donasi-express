export const parseDurationToMs = (duration: string): number => {
  const match = duration.match(/^(\d+)(s|m|h|d)$/i);

  if (!match) {
    throw new Error(
      `Invalid duration format: "${duration}". Use formats like 15m, 1h, 7d.`
    );
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return value * 1000;

    case "m":
      return value * 60 * 1000;

    case "h":
      return value * 60 * 60 * 1000;

    case "d":
      return value * 24 * 60 * 60 * 1000;

    default:
      throw new Error(`Unsupported duration unit: ${unit}`);
  }
};