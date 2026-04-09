import fs from 'fs'
import type {
  NormalizedConfig,
  RsbuildPlugin,
  RsbuildPluginAPI
} from '@rsbuild/core'
import * as cheerio from 'cheerio'
import path from 'path'

import { getCSPHeader } from './contentSecurityPolicy.Helper'
import type {
  TCspSource,
  TPluginContentSecurityPolicy
} from './contentSecurityPolicy.Type'
import { CONF_FILE_NAME } from './contentSecurityPolicy.Type'

/**
 * This plugin read integrity values from HTML page
 * and create CSP values in text format
 * @warning Currently Rsbuild doesn't support for dns-prefetch and preconnect
 * so ejs template has manual entry for the same
 */
export const pluginContentSecurityPolicy = (
  options: TPluginContentSecurityPolicy
): RsbuildPlugin => ({
  name: 'plugin-content-security-policy',
  setup: async (api: RsbuildPluginAPI) => {
    const { config } = options

    const {
      userDefinedCsp,
      scriptDirective,
      styleDirective,
      linkNonceValue = ''
    } = config
    const { hashEnabled: scriptHashEnabled = true } = scriptDirective
    const { hashEnabled: styleHashEnabled = false } = styleDirective

    // Get RsBuild configuration
    const rsBuildConfig = api.getRsbuildConfig()

    const {
      security,
      output: {
        distPath: { root }
      }
    } = rsBuildConfig as NormalizedConfig

    // Get security config
    const { sri } = security
    const { algorithm, enable } = sri

    if (!sri || !enable) {
      return
    }

    if (!algorithm) {
      return
    }

    /**
     * This will store integrity values from compilation stats
     *
     */
    api.onAfterBuild(() => {
      // Get index.html file path
      const indexHtmlPath = path.resolve(
        path.resolve(process.cwd()),
        root,
        'index.html'
      )

      // Read the index.html file
      let externalFileContent = fs.readFileSync(indexHtmlPath, {
        encoding: 'utf8'
      })

      // Load the conent
      const $ = cheerio.load(externalFileContent)

      /**
       * This will maintain all the integrity values
       * As it helps in generating final CSP values
       * It will read SRI values from html
       * and create a text csp values
       */
      const scriptsIntegrity: TCspSource[] = []
      const linksIntegrity: TCspSource[] = []

      if (scriptHashEnabled) {
        const scriptsElem = $('script')
        for (let i = 0; i < scriptsElem.length; i++) {
          const elem = $(scriptsElem[i])
          if (elem.attr('integrity')) {
            scriptsIntegrity.push(`'${elem.attr('integrity')}'` as TCspSource)
          }
        }
      }

      if (styleHashEnabled) {
        const linksElem = $('link')
        for (let i = 0; i < linksElem.length; i++) {
          const elem = $(linksElem[i])
          if (elem.attr('integrity')) {
            linksIntegrity.push(`'${elem.attr('integrity')}'` as TCspSource)
          }
        }
      }

      /**
       * Get final CSP value by mering default CSP, user provided CSP,
       * and Build generated SRI SHA value for script-scr dir
       * and nonce value for emotion style
       */
      const cspContent = getCSPHeader({
        cspValues: userDefinedCsp,
        linkNonceValue,
        scriptsIntegrity,
        linksIntegrity
      })

      // Get a file and write CSP text in the file
      const filePath = path.resolve(path.resolve(process.cwd()), CONF_FILE_NAME)

      // As per DEVOPS requirement use
      // 'add_header Content-Security-Policy' at the start of the file
      const fileContent = `add_header Content-Security-Policy "${cspContent}";`

      // Write a file
      fs.writeFile(filePath, fileContent, (error: unknown) => {
        if (error) {
          console.error('Error while writing a file - ', error)
        } else {
          console.log('File created')
        }
      })
    })
  }
})
