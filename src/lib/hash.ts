export function hashEmail(email: string): string {
  let hash = 5381;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 33) ^ email.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
