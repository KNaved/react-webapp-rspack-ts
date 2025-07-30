import type {
  NormalizedConfig,
  RsbuildPlugin,
  RsbuildPluginAPI
} from '@rsbuild/core'
import { type StatsAsset } from '@rspack/core'
import * as cheerio from 'cheerio'

import { createShaValue } from './createAssetIntegrity.Helper'
import type { TScriptsIntegrityMapper } from './createAssetIntegrity.Type'

export const pluginCreateAssetIntegrity = (): RsbuildPlugin => ({
  name: 'plugin-create-asset-integrity',
  setup: async (api: RsbuildPluginAPI) => {
    // Get RsBuild configuration
    const rsBuildConfig = api.getRsbuildConfig()

    const { security } = rsBuildConfig as NormalizedConfig

    // Get security config
    const { sri } = security
    const { algorithm, enable } = sri

    if (!sri || !enable) {
      return
    }

    if (!algorithm) {
      return
    }

    const scriptsIntegrityMapper: TScriptsIntegrityMapper = {}

    api.modifyHTML((html, { compilation }) => {
      // Load Cheerio
      const $ = cheerio.load(html)

      // Get Asset stats
      const statAssetsJson = compilation.getStats().toJson()
        .assets as StatsAsset[]

      // Regex to ignore static/js/async files
      // accept for .js extension
      const validJSRegex = new RegExp(
        // eslint-disable-next-line
        /^static\/js\/(?!async\/)[^\/]+\.js$/,
        'i'
      )

      statAssetsJson.forEach(asset => {
        const { name, integrity } = asset

        const isValidJsFile = name && validJSRegex.test(name)

        // If not js file then skip
        if (!isValidJsFile) return

        if (!integrity) {
          /**
           * If integrity value is not available in stats
           * then it will generate integrity value
           */
          const originalAsset = compilation.assets[name]
          const calculateIntegrityValue = createShaValue(
            originalAsset,
            algorithm!
          )

          scriptsIntegrityMapper[name] = calculateIntegrityValue
        }
        return null
      })

      // Update integrity value in the script attribute
      for (const scriptItem in scriptsIntegrityMapper) {
        const selector = $(`script[src="/${scriptItem}"]`)
        if (selector) {
          $(selector).attr('integrity', scriptsIntegrityMapper[scriptItem])
        }
      }

      return $.html()
    })
  }
})
