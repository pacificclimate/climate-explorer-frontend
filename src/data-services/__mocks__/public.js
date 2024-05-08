export function getVariableOptions() {
  return Promise.resolve({
    data: `
tasmin:
  decimalPrecision: 1
  shiftAnnualCycle:
    - tasmax
  `,
  });
}
