import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto"

const ITERATIONS = 120000
const KEY_LENGTH = 64
const DIGEST = "sha512"

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex")
  return `${ITERATIONS}:${salt}:${hash}`
}

export function verifyPassword(password: string, storedPassword: string) {
  const [iterationsRaw, salt, originalHash] = storedPassword.split(":")
  const iterations = Number(iterationsRaw)

  if (!iterations || !salt || !originalHash) {
    return false
  }

  const hash = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST)
  const original = Buffer.from(originalHash, "hex")

  return original.length === hash.length && timingSafeEqual(original, hash)
}
