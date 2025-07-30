document
  .querySelectorAll('link[rel="stylesheet"][media="print"]')
  .forEach(link => {
    if (link instanceof HTMLLinkElement) {
      const enableMedia = () => {
        link.media = 'all'
        link.removeEventListener('load', enableMedia)
      }
      if (link.sheet) {
        enableMedia()
      } else {
        link.addEventListener('load', enableMedia)
      }
    }
  })
