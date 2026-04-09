export type TExternalLink = HTMLLinkElement | HTMLLinkElement[]

export type TExternalParamsScript = Array<
  Partial<HTMLScriptElement> & { src: string; enableOnProdOnly?: boolean }
>

type TCspSourceUrl = `https://${string}` | `http://${string}`
export type TCspSourceIntegrity =
  | `sha256-${string}` // For hash-based sources or nonces
  | `sha384-${string}` // For hash-based sources or nonces
  | `sha512-${string}` // For hash-based sources or nonces

export type TCspSource =
  | "'self'"
  | "'unsafe-inline'"
  | "'unsafe-eval'"
  | "'none'"
  | 'data:'
  | 'blob:'
  | 'filesystem:'
  | TCspSourceUrl
  | TCspSourceIntegrity
  | `nonce-${string}` // For hash-based sources or nonces
  | "'strict-dynamic'"

// CSP directives object type
export type TCspValuesType = {
  'default-src'?: TCspSource[]
  'script-src'?: TCspSource[]
  'style-src'?: TCspSource[]
  'img-src'?: TCspSource[]
  'connect-src'?: TCspSource[]
  'font-src'?: TCspSource[]
  'object-src'?: TCspSource[]
  'media-src'?: TCspSource[]
  'frame-src'?: TCspSource[]
  'frame-ancestors'?: TCspSource[]
  'form-action'?: TCspSource[]
  'base-uri'?: TCspSource[]
  'report-uri'?: TCspSource[] // Report-uri typically takes a URL
  'report-to'?: TCspSource[] // Report-to typically takes a group name
  // ... add other CSP directives as needed
}

type TDirectiveDefaultConfig = {
  hashEnabled: boolean
}

export type TPluginContentSecurityPolicyConfig = {
  userDefinedCsp: TCspValuesType
  scriptDirective: TDirectiveDefaultConfig
  styleDirective: TDirectiveDefaultConfig
  linkNonceValue?: string
}

export type TPluginContentSecurityPolicy = {
  config: TPluginContentSecurityPolicyConfig
}

export const DEFAULT_CSP_VALUES: TCspValuesType = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'"],
  'font-src': [],
  'connect-src': [],
  'frame-src': [],
  'object-src': [],
  'base-uri': ["'self'"],
  'media-src': []
}

export const CONF_FILE_NAME = 'security_headers.conf'

export const HANDLE_EMPTY_CASES = [
  'media-src',
  'object-src',
  'connect-src',
  'frame-src',
  'frame-ancestors'
]
