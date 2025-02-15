/* eslint-disable no-mixed-operators */
/*****************************************************************************************************************************/
// imports
import { Buffer } from 'buffer'
import { SHA3, SHAKE } from 'sha3'
//import { KeyPair, MatrixA, Result } from './crystals-kyber.interface';

/*****************************************************************************************************************************/
const nttZetas = [
  2285, 2571, 2970, 1812, 1493, 1422, 287, 202, 3158, 622, 1577, 182, 962, 2127, 1855, 1468, 573, 2004, 264, 383, 2500,
  1458, 1727, 3199, 2648, 1017, 732, 608, 1787, 411, 3124, 1758, 1223, 652, 2777, 1015, 2036, 1491, 3047, 1785, 516,
  3321, 3009, 2663, 1711, 2167, 126, 1469, 2476, 3239, 3058, 830, 107, 1908, 3082, 2378, 2931, 961, 1821, 2604, 448,
  2264, 677, 2054, 2226, 430, 555, 843, 2078, 871, 1550, 105, 422, 587, 177, 3094, 3038, 2869, 1574, 1653, 3083, 778,
  1159, 3182, 2552, 1483, 2727, 1119, 1739, 644, 2457, 349, 418, 329, 3173, 3254, 817, 1097, 603, 610, 1322, 2044, 1864,
  384, 2114, 3193, 1218, 1994, 2455, 220, 2142, 1670, 2144, 1799, 2051, 794, 1819, 2475, 2459, 478, 3221, 3021, 996,
  991, 958, 1869, 1522, 1628,
]

const nttZetasInv = [
  1701, 1807, 1460, 2371, 2338, 2333, 308, 108, 2851, 870, 854, 1510, 2535, 1278, 1530, 1185, 1659, 1187, 3109, 874,
  1335, 2111, 136, 1215, 2945, 1465, 1285, 2007, 2719, 2726, 2232, 2512, 75, 156, 3000, 2911, 2980, 872, 2685, 1590,
  2210, 602, 1846, 777, 147, 2170, 2551, 246, 1676, 1755, 460, 291, 235, 3152, 2742, 2907, 3224, 1779, 2458, 1251, 2486,
  2774, 2899, 1103, 1275, 2652, 1065, 2881, 725, 1508, 2368, 398, 951, 247, 1421, 3222, 2499, 271, 90, 853, 1860, 3203,
  1162, 1618, 666, 320, 8, 2813, 1544, 282, 1838, 1293, 2314, 552, 2677, 2106, 1571, 205, 2918, 1542, 2721, 2597, 2312,
  681, 130, 1602, 1871, 829, 2946, 3065, 1325, 2756, 1861, 1474, 1202, 2367, 3147, 1752, 2707, 171, 3127, 3042, 1907,
  1836, 1517, 359, 758, 1441,
]

const paramsK = 3
const paramsN = 256
const paramsQ = 3329
const paramsQinv = 62209
const paramsETA = 2
/*****************************************************************************************************************************/
// CRYSTALS-KYBER JAVASCRIPT

function uint16(n) {
  return n % 65536
}
// indcpaRejUniform runs rejection sampling on uniform random bytes
// to generate uniform random integers modulo `Q`.
function indcpaRejUniform(buf, bufl, len) {
  const r = new Array(384).fill(0)
  let val0, val1 // d1, d2 in kyber documentation
  let pos = 0 // i
  let ctr = 0 // j

  while (ctr < len && pos + 3 <= bufl) {
    // compute d1 and d2
    val0 = (uint16(buf[pos] >> 0) | (uint16(buf[pos + 1]) << 8)) & 0xfff
    val1 = (uint16(buf[pos + 1] >> 4) | (uint16(buf[pos + 2]) << 4)) & 0xfff

    // increment input buffer index by 3
    pos = pos + 3

    // if d1 is less than 3329
    if (val0 < paramsQ) {
      // assign to d1
      r[ctr] = val0
      // increment position of output array
      ctr = ctr + 1
    }
    if (ctr < len && val1 < paramsQ) {
      r[ctr] = val1
      ctr = ctr + 1
    }
  }

  const result = [
    r, // Assuming `r` is an array of numbers
    ctr, // Assuming `ctr` is a number
  ]
  return result
}

// generateMatrixA deterministically generates a matrix `A` (or the transpose of `A`)
// from a seed. Entries of the matrix are polynomials that look uniformly random.
// Performs rejection sampling on the output of an extendable-output function (XOF).
function generateMatrixA(seed, transposed) {
  const a = new Array(3)
  const xof = new SHAKE(128)
  for (let i = 0; i < paramsK; i++) {
    a[i] = new Array(paramsK)
    const transpose = new Array(2)

    for (let j = 0; j < paramsK; j++) {
      // set if transposed matrix or not
      transpose[0] = j
      transpose[1] = i
      if (transposed) {
        transpose[0] = i
        transpose[1] = j
      }

      // obtain xof of (seed+i+j) or (seed+j+i) depending on above code
      // output is 672 bytes in length
      xof.reset()
      const buffer1 = Buffer.from(seed)
      const buffer2 = Buffer.from(transpose)
      xof.update(buffer1).update(buffer2)
      // Its commented after issue
      // const output = new Uint8Array(xof.digest({ buffer: Buffer.alloc(672) }));
      const output = new Uint8Array(xof.digest({ buffer: Buffer.alloc(672), format: 'binary' }))

      // run rejection sampling on the output from above
      const outputlen = 3 * 168 // 504
      let result = new Array(2)
      result = indcpaRejUniform(output.slice(0, 504), outputlen, paramsN)
      ;[a[i][j]] = result // the result here is an NTT-representation
      let [, ctr] = result // keeps track of index of output array from sampling function
      while (ctr < paramsN) {
        // if the polynomial hasnt been filled yet with mod q entries

        const outputn = output.slice(504, 672) // take last 168 bytes of byte array from xof

        let result1 = new Array(2)
        result1 = indcpaRejUniform(outputn, 168, paramsN - ctr) // run sampling function again
        // here is additional mod q polynomial coefficients
        // how many coefficients were accepted and are in the output
        const [missing, ctrn] = result1
        // starting at last position of output array from first sampling function until 256 is reached
        for (let k = ctr; k < paramsN; k++) {
          a[i][j][k] = missing[k - ctr] // fill rest of array with the additional coefficients until full
        }
        ctr = ctr + ctrn // update index
      }
    }
  }

  return a
}

/*****************************************************************************************************************************/

// prf provides a pseudo-random function (PRF) which returns
// a byte array of length `l`, using the provided key and nonce
// to instantiate the PRF's underlying hash function.
function prf(l, key, nonce) {
  const nonceArr = new Array(1)
  nonceArr[0] = nonce
  const hash = new SHAKE(256)
  hash.reset()
  const buffer1 = Buffer.from(key)
  const buffer2 = Buffer.from(nonceArr)
  hash.update(buffer1).update(buffer2)
  const buf = Buffer.from(hash.digest({ buffer: Buffer.alloc(l), format: 'hex' }), 'hex')
  // Its commented after issue
  // const buf = hash.digest({ buffer: Buffer.alloc(l) }); // 128 long byte array
  return buf
}

function int16(n) {
  let num = n
  const end = -32768
  const start = 32767

  if (num >= end && num <= start) {
    return n
  }
  if (num < end) {
    num = num + 32769
    num = num % 65536
    num = start + num
    return num
  }
  if (num > start) {
    num = num - 32768
    num = num % 65536
    num = end + num
    return num
  }
  return num
}

// any bit operations to be done in uint32 must have >>> 0
// javascript calculates bitwise in SIGNED 32 bit so you need to convert
function uint32(n) {
  return n % 4294967296
}

// byteopsLoad32 returns a 32-bit unsigned integer loaded from byte x.
function byteopsLoad32(x) {
  let r
  r = uint32(x[0])
  r = ((r | (uint32(x[1]) << 8)) >>> 0) >>> 0
  r = ((r | (uint32(x[2]) << 16)) >>> 0) >>> 0
  r = ((r | (uint32(x[3]) << 24)) >>> 0) >>> 0
  return uint32(r)
}

// byteopsCbd computes a polynomial with coefficients distributed
// according to a centered binomial distribution with parameter paramsETA,
// given an array of uniformly random bytes.
function byteopsCbd(buf) {
  let t, d
  let a, b
  const r = new Array(384).fill(0)
  for (let i = 0; i < paramsN / 8; i++) {
    t = byteopsLoad32(buf.slice(4 * i, buf.length)) >>> 0
    d = (t & 0x55555555) >>> 0
    d = (d + ((((t >> 1) >>> 0) & 0x55555555) >>> 0)) >>> 0
    for (let j = 0; 8 > j; j++) {
      a = int16((((d >> (4 * j + 0)) >>> 0) & 0x3) >>> 0)
      b = int16((((d >> (4 * j + paramsETA)) >>> 0) & 0x3) >>> 0)
      r[8 * i + j] = a - b
    }
  }
  return r
}

// sample samples a polynomial deterministically from a seed
// and nonce, with the output polynomial being close to a centered
// binomial distribution with parameter paramsETA = 2.
function sample(seed, nonce) {
  const l = (paramsETA * paramsN) / 4
  const p = prf(l, seed, nonce)
  return byteopsCbd(p)
}

function int32(n) {
  let num = n
  const end = -2147483648
  const start = 2147483647

  if (num >= end && num <= start) {
    return num
  }
  if (num < end) {
    num = num + 2147483649
    num = num % 4294967296
    num = start + num
    return num
  }
  if (num > start) {
    num = num - 2147483648
    num = num % 4294967296
    num = end + num
    return num
  }
  return num
}
// byteopsMontgomeryReduce computes a Montgomery reduction; given
// a 32-bit integer `a`, returns `a * R^-1 mod Q` where `R=2^16`.
function byteopsMontgomeryReduce(a) {
  const u = int16(int32(a) * paramsQinv)
  let t = u * paramsQ
  t = a - t
  t >>= 16
  return int16(t)
}

// nttFqMul performs multiplication followed by Montgomery reduction
// and returns a 16-bit integer congruent to `a*b*R^{-1} mod Q`.
function nttFqMul(a, b) {
  return byteopsMontgomeryReduce(a * b)
}

// ntt performs an inplace number-theoretic transform (NTT) in `Rq`.
// The input is in standard order, the output is in bit-reversed order.
function ntt(r) {
  let j = 0
  let k = 1
  let zeta
  let t
  // 128, 64, 32, 16, 8, 4, 2
  for (let l = 128; 2 <= l; l >>= 1) {
    // 0,
    for (let start = 0; 256 > start; start = j + l) {
      zeta = nttZetas[k]
      k = k + 1
      // for each element in the subsections (128, 64, 32, 16, 8, 4, 2) starting at an offset
      for (j = start; j < start + l; j++) {
        // compute the modular multiplication of the zeta and each element in the subsection
        t = nttFqMul(zeta, r[j + l]) // t is mod q
        // overwrite each element in the subsection as the opposite subsection element minus t
        r[j + l] = r[j] - t
        // add t back again to the opposite subsection
        r[j] = r[j] + t
      }
    }
  }
  return r
}

// barrett computes a Barrett reduction; given
// a integer `a`, returns a integer congruent to
// `a mod Q` in {0,...,Q}.
function barrett(a) {
  const v = ((1 << 24) + paramsQ / 2) / paramsQ
  let t = (v * a) >> 24
  t = t * paramsQ
  return a - t
}

// reduce applies Barrett reduction to all coefficients of a polynomial.
function reduce(r) {
  for (let i = 0; i < paramsN; i++) {
    r[i] = barrett(r[i])
  }
  return r
}

// adds two polynomials.
function add(a, b) {
  const c = new Array(384)
  for (let i = 0; i < paramsN; i++) {
    c[i] = a[i] + b[i]
  }
  return c
}

// polyToMont performs the in-place conversion of all coefficients
// of a polynomial from the normal domain to the Montgomery domain.
function polyToMont(r) {
  // let f = int16(((uint64(1) << 32) >>> 0) % uint64(paramsQ));
  const f = 1353 // if paramsQ changes then this needs to be updated
  for (let i = 0; i < paramsN; i++) {
    r[i] = byteopsMontgomeryReduce(int32(r[i]) * int32(f))
  }
  return r
}

// nttBaseMul performs the multiplication of polynomials
// in `Zq[X]/(X^2-zeta)`. Used for multiplication of elements
// in `Rq` in the number-theoretic transformation domain.
function nttBaseMul(a0, a1, b0, b1, zeta) {
  const r = [0, 0]
  r[0] = nttFqMul(a1, b1)
  r[0] = nttFqMul(r[0], zeta)
  r[0] = r[0] + nttFqMul(a0, b0)
  r[1] = nttFqMul(a0, b1)
  r[1] = r[1] + nttFqMul(a1, b0)
  return r
}

// polyBaseMulMontgomery performs the multiplication of two polynomials
// in the number-theoretic transform (NTT) domain.
function polyBaseMulMontgomery(a, b) {
  let rx, ry
  for (let i = 0; i < paramsN / 4; i++) {
    rx = nttBaseMul(a[4 * i + 0], a[4 * i + 1], b[4 * i + 0], b[4 * i + 1], nttZetas[64 + i])
    ry = nttBaseMul(a[4 * i + 2], a[4 * i + 3], b[4 * i + 2], b[4 * i + 3], -nttZetas[64 + i])
    ;[a[4 * i + 0], a[4 * i + 1], a[4 * i + 2], a[4 * i + 3]] = [rx[0], rx[1], ry[0], ry[1]]
    // Commented after issue
    // a[4 * i + 0] = rx[0];
    // a[4 * i + 1] = rx[1];
    // a[4 * i + 2] = ry[0];
    // a[4 * i + 3] = ry[1];
  }
  return a
}

// pointwise-multiplies elements of polynomial-vectors
// `a` and `b`, accumulates the results into `r`, and then multiplies by `2^-16`.
function multiply(a, b) {
  let r = polyBaseMulMontgomery(a[0], b[0])
  let t
  for (let i = 1; i < paramsK; i++) {
    t = polyBaseMulMontgomery(a[i], b[i])
    r = add(r, t)
  }
  return reduce(r)
}

// subtractQ applies the conditional subtraction of q to each coefficient of a polynomial.
// if a is 3329 then convert to 0
// Returns:     a - q if a >= q, else a
function subtractQ(r) {
  for (let i = 0; i < paramsN; i++) {
    r[i] = r[i] - paramsQ // should result in a negative integer
    // push left most signed bit to right most position
    // javascript does bitwise operations in signed 32 bit
    // add q back again if left most bit was 0 (positive number)
    r[i] = r[i] + ((r[i] >> 31) & paramsQ)
  }
  return r
}

function byte(n) {
  return n % 256
}

// polyToBytes serializes a polynomial into an array of bytes.
function polyToBytes(a) {
  let t0, t1
  const r = new Array(384)
  const a2 = subtractQ(a) // Returns: a - q if a >= q, else a (each coefficient of the polynomial)
  // for 0-127
  for (let i = 0; i < paramsN / 2; i++) {
    // get two coefficient entries in the polynomial
    t0 = uint16(a2[2 * i])
    t1 = uint16(a2[2 * i + 1])

    // convert the 2 coefficient into 3 bytes
    r[3 * i + 0] = byte(t0 >> 0) // byte() does mod 256 of the input (output value 0-255)
    r[3 * i + 1] = byte(t0 >> 8) | byte(t1 << 4)
    r[3 * i + 2] = byte(t1 >> 4)
  }
  return r
}

// indcpaKeyGen generates public and private keys for the CPA-secure
// public-key encryption scheme underlying Kyber.
function indcpaKeyGen(seedParam) {
  // random bytes for seed
  // let rnd = new Uint8Array(32);
  // webcrypto.getRandomValues(rnd); // web api cryptographically strong random values
  const rnd = seedParam
  // hash rnd with SHA3-512
  const buffer1 = Buffer.from(rnd)
  const hash1 = new SHA3(512)
  hash1.update(buffer1)
  const seed = new Uint8Array(hash1.digest())
  const publicSeed = seed.slice(0, 32)
  const noiseSeed = seed.slice(32, 64)

  // generate public matrix A (already in NTT form)
  const a = generateMatrixA(publicSeed, false)

  // sample secret s
  const s = new Array(paramsK)
  let nonce = 0
  for (let i = 0; i < paramsK; i++) {
    s[i] = sample(noiseSeed, nonce)
    nonce = nonce + 1
  }

  // sample noise e
  const e = new Array(paramsK)
  for (let i = 0; i < paramsK; i++) {
    e[i] = sample(noiseSeed, nonce)
    nonce = nonce + 1
  }

  // perform number theoretic transform on secret s
  for (let i = 0; i < paramsK; i++) {
    s[i] = ntt(s[i])
  }

  // perform number theoretic transform on error/noise e
  for (let i = 0; i < paramsK; i++) {
    e[i] = ntt(e[i])
  }

  // barrett reduction
  for (let i = 0; i < paramsK; i++) {
    s[i] = reduce(s[i])
  }

  // KEY COMPUTATION
  // A.s + e = pk

  // calculate A.s
  const pk = new Array(paramsK)
  for (let i = 0; i < paramsK; i++) {
    // montgomery reduction
    pk[i] = polyToMont(multiply(a[i], s))
  }

  // calculate addition of e
  for (let i = 0; i < paramsK; i++) {
    pk[i] = add(pk[i], e[i])
  }

  // barrett reduction
  for (let i = 0; i < paramsK; i++) {
    pk[i] = reduce(pk[i])
  }

  // ENCODE KEYS
  // const keys = new Array(2);
  const keys = [[], []]

  // PUBLIC KEY
  // turn polynomials into byte arrays
  keys[0] = []
  let bytes = []
  for (let i = 0; i < paramsK; i++) {
    bytes = polyToBytes(pk[i])
    for (let j = 0; j < bytes.length; j++) {
      keys[0].push(bytes[j])
    }
  }
  // append public seed
  for (let i = 0; i < publicSeed.length; i++) {
    keys[0].push(publicSeed[i])
  }

  // PRIVATE KEY
  // turn polynomials into byte arrays
  keys[1] = []
  bytes = []
  for (let i = 0; i < paramsK; i++) {
    bytes = polyToBytes(s[i])
    for (let j = 0; j < bytes.length; j++) {
      keys[1].push(bytes[j])
    }
  }
  return keys
}

// 1. KeyGen
export function keyGen768(seed) {
  // IND-CPA keypair
  const indcpakeys = indcpaKeyGen(seed)
  const [pk, sk] = indcpakeys
  // FO transform to make IND-CCA2

  // get hash of pk
  const buffer1 = Buffer.from(pk)
  const hash1 = new SHA3(256)
  hash1.update(buffer1)
  const pkh = hash1.digest()

  // read 32 random values (0-255) into a 32 byte array
  const rnd = seed

  // const rnd = crypto.randomBytes(32);

  // let rnd = new Uint8Array(32);
  // webcrypto.getRandomValues(rnd); // web api cryptographically strong random values

  // concatenate to form IND-CCA2 private key: sk + pk + h(pk) + rnd
  for (let i = 0; i < pk.length; i++) {
    sk.push(pk[i])
  }
  for (let i = 0; i < pkh.length; i++) {
    sk.push(pkh[i])
  }
  for (let i = 0; i < rnd.length; i++) {
    sk.push(rnd[i])
  }

  // const keys = new Array(2);
  // keys[0] = pk;
  // keys[1] = sk;

  const keys = [pk, sk]

  return keys
}

// polyFromBytes de-serialises an array of bytes into a polynomial,
// and represents the inverse of polyToBytes.
function polyFromBytes(a) {
  const r = new Array(384).fill(0)
  for (let i = 0; i < paramsN / 2; i++) {
    r[2 * i] = int16(((uint16(a[3 * i + 0]) >> 0) | (uint16(a[3 * i + 1]) << 8)) & 0xfff)
    r[2 * i + 1] = int16(((uint16(a[3 * i + 1]) >> 4) | (uint16(a[3 * i + 2]) << 4)) & 0xfff)
  }
  return r
}

// polyFromMsg converts a 32-byte message to a polynomial.
function polyFromMsg(msg) {
  const r = new Array(384).fill(0) // each element is int16 (0-65535)
  let mask // int16
  for (let i = 0; i < paramsN / 8; i++) {
    for (let j = 0; 8 > j; j++) {
      mask = -1 * int16((msg[i] >> j) & 1)
      r[8 * i + j] = mask & int16((paramsQ + 1) / 2)
    }
  }
  return r
}

// nttInverse performs an inplace inverse number-theoretic transform (NTT)
// in `Rq` and multiplication by Montgomery factor 2^16.
// The input is in bit-reversed order, the output is in standard order.
function nttInverse(r) {
  let j = 0
  let k = 0
  let zeta
  let t
  for (let l = 2; 128 >= l; l <<= 1) {
    for (let start = 0; 256 > start; start = j + l) {
      zeta = nttZetasInv[k]
      k = k + 1
      for (j = start; j < start + l; j++) {
        t = r[j]
        r[j] = barrett(t + r[j + l])
        r[j + l] = t - r[j + l]
        r[j + l] = nttFqMul(zeta, r[j + l])
      }
    }
  }
  for (j = 0; 256 > j; j++) {
    r[j] = nttFqMul(r[j], nttZetasInv[127])
  }
  return r
}

// compress1 lossily compresses and serializes a vector of polynomials.
function compress1(u) {
  let rr = 0
  const r = new Array(960)
  const t = new Array(4)
  for (let i = 0; i < paramsK; i++) {
    for (let j = 0; j < paramsN / 4; j++) {
      for (let k = 0; 4 > k; k++) {
        // parse {0,...,3328} to {0,...,1023}
        t[k] = (((u[i][4 * j + k] << 10) + paramsQ / 2) / paramsQ) & 0b1111111111
      }
      // converts 4 12-bit coefficients {0,...,3328} to 5 8-bit bytes {0,...,255}
      // 48 bits down to 40 bits per block
      r[rr + 0] = byte(t[0] >> 0)
      r[rr + 1] = byte((t[0] >> 8) | (t[1] << 2))
      r[rr + 2] = byte((t[1] >> 6) | (t[2] << 4))
      r[rr + 3] = byte((t[2] >> 4) | (t[3] << 6))
      r[rr + 4] = byte(t[3] >> 2)
      rr = rr + 5
    }
  }
  return r
}

// compress2 lossily compresses and subsequently serializes a polynomial.
function compress2(v) {
  let rr = 0
  const r = new Array(128)
  const t = new Array(8)
  for (let i = 0; i < paramsN / 8; i++) {
    for (let j = 0; 8 > j; j++) {
      t[j] = byte(((v[8 * i + j] << 4) + paramsQ / 2) / paramsQ) & 0b1111
    }
    r[rr + 0] = t[0] | (t[1] << 4)
    r[rr + 1] = t[2] | (t[3] << 4)
    r[rr + 2] = t[4] | (t[5] << 4)
    r[rr + 3] = t[6] | (t[7] << 4)
    rr = rr + 4
  }
  return r
}

// indcpaEncrypt is the encryption function of the CPA-secure
// public-key encryption scheme underlying Kyber.
function indcpaEncrypt(pk1, msg, coins) {
  // DECODE PUBLIC KEY
  const pk = new Array(paramsK)
  let start
  let end
  for (let i = 0; i < paramsK; i++) {
    start = i * 384
    end = (i + 1) * 384
    pk[i] = polyFromBytes(pk1.slice(start, end))
  }
  const seed = pk1.slice(1152, 1184)

  // generate transpose of public matrix A
  const at = generateMatrixA(seed, true)

  // sample random vector r
  const r = new Array(paramsK)
  let nonce = 0
  for (let i = 0; i < paramsK; i++) {
    r[i] = sample(coins, nonce)
    nonce = nonce + 1
  }

  // sample error vector e1
  const e1 = new Array(paramsK)
  for (let i = 0; i < paramsK; i++) {
    e1[i] = sample(coins, nonce)
    nonce = nonce + 1
  }

  // sample e2
  const e2 = sample(coins, nonce)

  // perform number theoretic transform on random vector r
  for (let i = 0; i < paramsK; i++) {
    r[i] = ntt(r[i])
  }

  // barrett reduction
  for (let i = 0; i < paramsK; i++) {
    r[i] = reduce(r[i])
  }

  // ENCRYPT COMPUTATION
  // A.r + e1 = u
  // pk.r + e2 + m = v

  // calculate A.r
  const u = new Array(paramsK)
  for (let i = 0; i < paramsK; i++) {
    u[i] = multiply(at[i], r)
  }

  // perform inverse number theoretic transform on A.r
  for (let i = 0; i < paramsK; i++) {
    u[i] = nttInverse(u[i])
  }

  // calculate addition of e1
  for (let i = 0; i < paramsK; i++) {
    u[i] = add(u[i], e1[i])
  }

  // decode message m
  const m = polyFromMsg(msg)

  // calculate pk.r
  let v = multiply(pk, r)

  // perform inverse number theoretic transform on pk.r
  v = nttInverse(v)

  // calculate addition of e2
  v = add(v, e2)

  // calculate addition of m
  v = add(v, m)

  // barrett reduction
  for (let i = 0; i < paramsK; i++) {
    u[i] = reduce(u[i])
  }

  // barrett reduction
  v = reduce(v)

  // compress
  const c1 = compress1(u)
  const c2 = compress2(v)

  // return c1 || c2
  return c1.concat(c2)
}

/*****************************************************************************************************************************/
// 2. Encrypt
export function Encrypt768(pk, m) {
  // hash m with SHA3-256
  const buffer1 = Buffer.from(m)
  const hash1 = new SHA3(256)
  hash1.update(buffer1)
  const mh = hash1.digest()

  // hash pk with SHA3-256
  const buffer2 = Buffer.from(pk)
  const hash2 = new SHA3(256)
  hash2.update(buffer2)
  const pkh = hash2.digest()

  // hash mh and pkh with SHA3-512
  const buffer3 = Buffer.from(mh)
  const buffer4 = Buffer.from(pkh)
  const hash3 = new SHA3(512)
  hash3.update(buffer3).update(buffer4)
  const kr = new Uint8Array(hash3.digest())
  const kr1 = kr.slice(0, 32)
  const kr2 = kr.slice(32, 64)

  // generate ciphertext c
  const c = indcpaEncrypt(pk, mh, kr2)

  // hash ciphertext with SHA3-256
  const buffer5 = Buffer.from(c)
  const hash4 = new SHA3(256)
  hash4.update(buffer5)
  const ch = hash4.digest()

  // hash kr1 and ch with SHAKE-256
  const buffer6 = Buffer.from(kr1)
  const buffer7 = Buffer.from(ch)
  const hash5 = new SHAKE(256)
  hash5.update(buffer6).update(buffer7)
  const ss = hash5.digest()

  return ss
}
