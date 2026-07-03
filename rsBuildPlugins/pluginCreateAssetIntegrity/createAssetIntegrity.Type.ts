export type TCspSourceIntegrity =
  | `sha256-${string}` // For hash-based sources or nonces
  | `sha384-${string}` // For hash-based sources or nonces
  | `sha512-${string}` // For hash-based sources or nonces

export type TScriptsIntegrityMapper = Record<string, TCspSourceIntegrity | null>
