/**
 * expects version strings following the usual semantic versioning,
 * i.e.: major.minor.patch
 * e.g.: '1.10.1'
 * Does not allow variations like 1.0.0-rc.
 * returns
 *   1 if A > B,
 *   0 if A = B,
 *  -1 if A < B
 */
export const versionCompare = (versionA: string, versionB: string): number => {
  for (const s of [versionA, versionB]) {
    const re = /^\d+(.\d+){0,2}$/ // only accept numbers and dots
    if (!(typeof s === 'string' || (s as unknown) instanceof String) || !s.match(re)) {
      throw new Error(`versionCompare: invalid argument ${s}`)
    }
  }
  const chunksA = versionA.split(/\./g, 3)
  const chunksB = versionB.split(/\./g, 3)

  while (chunksA.length < chunksB.length) chunksA.push('0')
  while (chunksB.length < chunksA.length) chunksB.push('0')

  const chunksAint = chunksA.map((i) => parseInt(i, 10))
  const chunksBint = chunksB.map((i) => parseInt(i, 10))
  for (let i = 0; i < chunksA.length; i++) {
    if (chunksAint[i] !== chunksBint[i]) {
      return chunksAint[i] > chunksBint[i] ? 1 : -1
    }
  }
  return 0
}
