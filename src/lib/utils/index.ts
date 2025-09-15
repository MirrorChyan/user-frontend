export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 25);
  const lightness = 45 + (Math.abs(hash) % 15);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
