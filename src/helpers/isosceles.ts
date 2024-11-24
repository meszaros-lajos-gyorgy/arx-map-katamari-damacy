// functions for calculating parts of an isosceles triangles in regular n-gon
// based on: https://math.stackexchange.com/a/1712475/355978
// / = r or radius
// \ = r or radius
// _ = s or side
// | = a or altitude
// angle between /\ = theta (in radians)

/**
 * @param theta angle between the two sides in radians
 *
 * ```
 * a = r * cos(theta / 2)
 * a / cos(theta / 2) = r
 * ```
 */
export function radiusFromAltitude(altitude: number, theta: number) {
  return altitude / Math.cos(theta / 2)
}

/**
 * @param theta angle between the two sides in radians
 *
 * ```
 * s / 2 = r * sin(theta / 2)
 * s = 2 * r * sin(theta / 2)
 * ```
 */
export function sideFromAltitude(altitude: number, theta: number) {
  return 2 * radiusFromAltitude(altitude, theta) * Math.sin(theta / 2)
}

/**
 * @param theta angle between the two sides in radians
 *
 * ```
 * s / 2 = r * sin(theta / 2)
 * (s / 2) / sin(theta / 2) = r
 * ```
 */
export function radiusFromSide(side: number, theta: number) {
  return side / 2 / Math.sin(theta / 2)
}

/**
 * @param theta angle between the two sides in radians
 *
 * ```
 * a = r * cos(theta / 2)
 * ```
 */
export function altitudeFromSide(side: number, theta: number) {
  return radiusFromSide(side, theta) * Math.cos(theta / 2)
}
