import type { TPluginContentSecurityPolicyConfig } from './rsBuildPlugins/pluginContentSecurityPolicy/contentSecurityPolicy.Type'

const cspConfig: TPluginContentSecurityPolicyConfig = {
  userDefinedCsp: {
    'style-src': [`'unsafe-inline'`]
  },
  scriptDirective: {
    // true by default
    // If we require unsafe-inline and unsafe-eval then make it false
    hashEnabled: true
  },
  styleDirective: {
    // false by default
    hashEnabled: false
  }
}

export default cspConfig
