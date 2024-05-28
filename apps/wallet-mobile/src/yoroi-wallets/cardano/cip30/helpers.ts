import {ed25519} from '@noble/curves/ed25519'
import {sha512} from '@noble/hashes/sha512'
import assert from 'assert'

type Bytes = Uint8Array

export function addMul8(a: Bytes, b: Bytes): Bytes {
  assert(a.length === 32 && b.length === 32)
  return add256(a, _bytes(BigInt.asUintN(227, _scalar(b) << 3n)))
}

export function add256(a: Bytes, b: Bytes): Bytes {
  assert(a.length === 32 && b.length === 32)
  const t = new Uint8Array(32)
  let c = 0
  for (let i = 0; i < 32; i++) {
    const x = a[i] + b[i] + c
    t[i] = x
    c = x >>> 8
  }
  return t
}

export function baseMultiply(x: Bytes): Bytes {
  assert(x.length === 32 || x.length === 64)
  return ed25519.ExtendedPoint.BASE.multiply(_scalar(x) % ed25519.CURVE.n).toRawBytes()
}

export function pointAdd(a: Bytes, b: Bytes): Bytes {
  const m = baseMultiply(addMul8(new Uint8Array(32), b))
  const p = ed25519.ExtendedPoint.fromAffine(_decodePoint(a))
  const q = ed25519.ExtendedPoint.fromAffine(_decodePoint(m))
  return _encodePoint(p.add(q))
}

export function signBip32(message: Bytes, secretKey: Bytes) {
  const h = sha512(message)
  const p = baseMultiply(h)
  const s = _scalar(sha512(new Uint8Array([...p, ...baseMultiply(secretKey), ...message])))
  return new Uint8Array([...p, ..._bytes((_scalar(h) + s * _scalar(secretKey)) % ed25519.CURVE.n)])
}

interface Point {
  readonly x: bigint
  readonly y: bigint
}

function _encodePoint(point: Point): Bytes {
  const t = new Uint8Array(32)
  t.set(_bytes(point.y))
  if (point.x & 1n) t[31] |= 128
  return t
}

function _decodePoint(point: Bytes): Point {
  const p = new Uint8Array(point)
  p[31] &= 127
  const y = _scalar(p)
  return _pointFromY(y, point[31] >= 128)
}

function _pointFromY(y: bigint, odd: boolean): Point {
  const c = ed25519.CURVE
  const f = c.Fp
  const s = f.sqr(y)
  const a = f.sub(s, 1n)
  const b = f.sub(f.mul(s, BigInt(c.d)), BigInt(c.a))
  const m = f.mul(a, f.inv(b))
  if (!m) {
    assert(!odd)
    return {x: 0n, y}
  }
  const x = f.sqrt(m)
  assert(!f.sub(f.sqr(x), m))
  if (!!(x & 1n) !== odd) return {x: f.neg(x), y}
  return {x, y}
}

function _scalar(x: Bytes): bigint {
  assert(x.length === 32 || x.length === 64)
  let t = 0n
  for (let i = x.length - 1; i >= 0; i--) t = (t << 8n) + BigInt(x[i])
  return t
}

function _bytes(x: bigint): Bytes {
  assert(x === BigInt.asUintN(256, x))
  const t = new Uint8Array(32)
  let v = x
  for (let i = 0; i < 32; i++) {
    t[i] = Number(v & 255n)
    v >>= 8n
  }
  return t
}
