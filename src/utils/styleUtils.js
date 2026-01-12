export const buildImageStyle = (url, zoom = 0, offsetX = 0, offsetY = 0) => ({
  backgroundImage: `url(${url})`,
  backgroundSize: `${100 + Number(zoom || 0)}%`,
  backgroundPosition: `${50 + Number(offsetX || 0)}% ${50 + Number(offsetY || 0)}%`
});
