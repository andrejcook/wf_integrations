export function getObjectByKey(keyString: string, obj: any): any {
  if (keyString === null || keyString === undefined) {
    return obj;
  }

  const keys = keyString.split('.');
  if (keys.length === 0) {
    return obj;
  }

  return keys.reduce((acc, key) => acc && acc[key], obj);
}
