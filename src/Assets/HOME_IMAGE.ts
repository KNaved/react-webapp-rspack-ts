const HOME_IMAGE = [
  {
    src: new URL('~/src/AssetFiles/home.png?as=avif', import.meta.url).href,
    alt: 'Home Image',
    as: 'image/avif',
    type: 'image/avif' // INFO: On iOS versions below 16, the type attribute is required to display the next supported fallback image when next-gen formats like AVIF are not supported.
  },
  {
    src: new URL('~/src/AssetFiles/home.png?as=webp', import.meta.url).href,
    alt: 'Home Image',
    as: 'image/webp',
    type: 'image/webp'
  },
  {
    src: new URL('~/src/AssetFiles/home.png', import.meta.url).href,
    alt: 'Home Image',
    as: 'image/png',
    type: 'image/png'
  }
]

export default HOME_IMAGE
