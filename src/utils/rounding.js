/**
 * Decimal adjustment of a number.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
 *
 * @param type     The type of adjustment.
 * @param value    The number.
 * @param exponent The exponent (the 10 logarithm of the adjustment base). (Optional, default 0)
 * @returns        The adjusted value.
 */
const decimalAdjust = (type: string, value: number, exponent: ?number = 0): number => {
  // If the exp is undefined or zero...
  if (+exponent === 0) {
    return Math[type](value);
  }
  let returnValue = value;
  returnValue = +returnValue;
  const exp = +exponent;
  // If the value is not a number or the exponent is not an integer...
  if (Number.isNaN(returnValue) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // If the value is negative...
  if (returnValue < 0) {
    return -decimalAdjust(type, -returnValue, exp);
  }
  // Shift
  returnValue = returnValue.toString().split('e');
  returnValue = Math[type](+`${returnValue[0]}e${returnValue[1] ? +returnValue[1] - exp : -exp}`);
  // Shift back
  returnValue = returnValue.toString().split('e');
  return +(`${returnValue[0]}e${returnValue[1] ? (+returnValue[1] + exp) : exp}`);
};
export const round10 = (value, exponent) => decimalAdjust('round', value, exponent);
export const floor10 = (value, exponent) => decimalAdjust('floor', value, exponent);
export const ciel10 = (value, exponent) => decimalAdjust('ciel', value, exponent);

/**
 * Compute the precision of a number. Any value larger than 0 returns
 * precision 0.
 * @param value - value to compute precision of
 */
export function precision(value: number) {
  if (!Number.isFinite(value)) return 0;

  let e = 1;
  let precisionNumber = 0;
  while ((Math.round(value * e) / e) !== value) {
    e *= 10; precisionNumber++;
  }
  return precisionNumber;
}

/**
 * Round a floating point value to a nice number with a given precision
 * (without floating point shenanigans)
 * https://www.kirupa.com/html5/rounding_numbers_in_javascript.htm
 * @param value - value to round
 * @param desiredPrecision - desired precision of the resulting value
 */
export function roundToNiceNumber(value: number, desiredPrecision: number) {
  const p = 10 ** desiredPrecision;
  return Math.round(value * p) / p;
}

/**
 * Round a floating point value to a given step size
 * @param value - value to round
 * @param value - the step size to round to. Should be smaller than the value
 */
export function roundValueToStepSize(value: number, step: number) {
  const roundedToStep = Math.round(value / step) * step;
  const res = roundToNiceNumber(roundedToStep, precision(step));

  // If the rounding did not result in a finite value, just return the
  // initial value (even if it's not "nice" and exactly matching the steps size)
  if (!Number.isFinite(res)) {
    return value;
  }

  return res;
}
