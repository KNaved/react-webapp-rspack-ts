const nonce =
  document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content') ??
  ''
// @ts-ignore
window.__nonce__ = nonce
