export const imgSrc = (src: string, type = "svg"): string =>
  new URL(`/src/assets/${src}.${type}`, import.meta.url).href;

export function setStateIfMounted(
  newState: any,
  setStateFunc: (state: any) => void,
  isMounted: boolean
): void {
  // update state only if component is mounted
  if (isMounted) {
    setStateFunc(newState);
  }
}
