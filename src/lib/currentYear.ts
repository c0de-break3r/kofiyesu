/** Always resolves to the visitor's current calendar year at runtime. */
export function getCurrentYear() {
  return new Date().getFullYear();
}
