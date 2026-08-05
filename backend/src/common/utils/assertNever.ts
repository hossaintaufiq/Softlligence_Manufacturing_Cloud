/** Shared helpers — expand in later sections */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}
