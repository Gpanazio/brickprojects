export const buildImageStyle = (url, zoom = 0, offsetX = 0, offsetY = 0) => ({
  //backgroundImage: `url(${url})`,
  //backgroundSize: `${100 + Number(zoom || 0)}%`,
  //backgroundPosition: `${50 + Number(offsetX || 0)}% ${50 + Number(offsetY || 0)}%`,
  objectFit: 'cover',
  objectPosition: `${50 + Number(offsetX || 0)}% ${50 + Number(offsetY || 0)}%`,
  transform: `scale(${1 + Number(zoom || 0) / 100})`,
  transition: 'transform 0.3s ease-out, object-position 0.3s ease-out'
});
