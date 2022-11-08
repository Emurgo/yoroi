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
export type Version = `${number}.${number}.${number}` | `${number}.${number}` | `${number}`

export const versionCompare = (versionA: Version, versionB: Version): number => {
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
