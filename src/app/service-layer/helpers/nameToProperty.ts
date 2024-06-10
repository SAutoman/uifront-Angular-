export function nameToProperty(name: string) {
  return (name || '').trim().replace(/\s+/g, '-');
}
