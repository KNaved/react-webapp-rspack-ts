import type { TPluginContentSecurityPolicyConfig } from './rsBuildPlugins/pluginContentSecurityPolicy/contentSecurityPolicy.Type'

const cspConfig: TPluginContentSecurityPolicyConfig = {
  userDefinedCsp: {
    'style-src': [`'unsafe-inline'`]
  }
}

export default cspConfig
