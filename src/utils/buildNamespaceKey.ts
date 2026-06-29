export function buildNamespaceKey(name: string, startDate: string): string {
  if (!name || !startDate) {
    return '';
  }

  const year = new Date(startDate).getFullYear();

  const words = name.toLowerCase().match(/[a-z0-9]+/g);

  if (!words) {
    return '';
  }

  const camelCaseName = words
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');

  return `${camelCaseName}${year}`;
}