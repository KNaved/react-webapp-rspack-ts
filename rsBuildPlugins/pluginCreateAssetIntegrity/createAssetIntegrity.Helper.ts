import crypto from 'node:crypto'
import type { SriAlgorithm } from '@rsbuild/core'
import type { Asset } from '@rspack/core'

import { type TCspSourceIntegrity } from './createAssetIntegrity.Type'

/** Function createShaValue - Create SRI sha value of given asset
 * It has encoding utf8 and base64
 * @param asset - Rspack compiler assets with source
 * @param algo - Security algo value
 * @returns TCspSourceIntegrity
 */
export const createShaValue = (
  asset: Asset['source'],
  algo: SriAlgorithm
): TCspSourceIntegrity => {
  const source = asset?.source() as string
  const hash = crypto.createHash(algo).update(source, 'utf8').digest('base64')
  const integrity: TCspSourceIntegrity = `${algo}-${hash}`
  return integrity
}

/** Function generateNonceValue
 * This function generate a random hash value
 * This is used for dynamic nonce value generation
 * @returns string
 */
export const generateNonceValue = (): string => {
  const nonce = crypto.randomBytes(16).toString('base64')
  return nonce
}
