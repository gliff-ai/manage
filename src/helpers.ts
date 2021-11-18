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
