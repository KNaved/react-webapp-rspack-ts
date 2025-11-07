// @ts-nocheck
/* eslint no-var: 0 */ // --> OFF
/* eslint no-undef: 0 */ // --> OFF
;(function () {
  try {
    // Test for native `import` statement support
    new Function('import("")')
  } catch (err) {
    if (err instanceof SyntaxError && window.supportedBrowsers) {
      // biome-ignore lint/style/noVar: want this js to be es5
      // biome-ignore lint/correctness/noInnerDeclarations: want to test support only if import not supported
      var isSupportedBrowser = window.supportedBrowsers.test(
        window.navigator.userAgent
      )

      if (!isSupportedBrowser) {
        document.body.innerHTML = `
           <div style="display: flex;justify-content: center; flex-direction: column;align-items: center;height: 100vh;text-align: center;">
            <div style="width: 80%">
              <h1>Unsupported Browser</h1>
              <p>Your browser does not support modern JavaScript features required for this application.</p>
              <p>Please update your browser or switch to a modern browser like Chrome, Firefox, or Edge.</p>
            </div>
          </div>
        `
      } else {
        document.body.innerHTML = `
           <div style="display: flex;justify-content: center; flex-direction: column;align-items: center;height: 100vh;text-align: center;">
            <div style="width: 80%">
              <h1>Something Went wrong</h1>
              <p>Your browser does not support modern JavaScript features required for this application.</p>
              <p>Please update your browser or switch to a modern browser like Chrome, Firefox, or Edge.</p>
            </div>
          </div>
        `
      }
    }
  }
})()
