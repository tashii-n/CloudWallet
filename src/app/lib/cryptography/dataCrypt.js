import { Buffer } from 'buffer'
import * as CryptoJS from 'crypto-js'
import { Encrypt768, keyGen768 } from './crystal-kyber'
export const getSeed = async secretValue => {
  return Buffer.from(secretValue)
}
export const encryptPayload = async (pK, data) => {
  const seed = await getSeed(pK)
  // Key-Pair generation
  const [publicKey, privateKey] = await keyGen768(seed)
  // Created iv using private key
  const bf = Buffer.from(privateKey)
  const iv = bf.slice(0, 8).toString('hex')
  // generate Symmetric key
  const symmetricKey = await Encrypt768(publicKey, seed)
  // encrypt data using symmetric key
  const cipher = await CryptoJS.AES.encrypt(data, symmetricKey.toString('base64'), { iv: iv }).toString()
  return cipher
}
export const decryptPayload = async (pK, encryptedData) => {
  const seed = await getSeed(pK)
  const [publicKey, privateKey] = await keyGen768(seed)
  const bf = Buffer.from(privateKey)
  const iv = bf.slice(0, 8).toString('hex')
  const symmetricKey = await Encrypt768(publicKey, seed)
  const decipher = await CryptoJS.AES.decrypt(encryptedData, symmetricKey.toString('base64'), { iv: iv }).toString(
    CryptoJS.enc.Utf8,
  )
  return decipher
}