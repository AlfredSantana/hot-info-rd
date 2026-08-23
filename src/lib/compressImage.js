/**
 * Comprime una imagen en el navegador antes de subirla.
 * Redimensiona si excede el ancho máximo y ajusta calidad JPEG.
 */
export function compressImage(file, { maxWidth = 1920, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    // Si no es imagen o es muy pequeña, no hace falta comprimir
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo comprimir la imagen.'))
              return
            }
            // Si la versión comprimida termina más pesada que el original, usa el original
            if (blob.size >= file.size) {
              resolve(file)
              return
            }
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, '.jpg'),
              { type: 'image/jpeg' }
            )
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsDataURL(file)
  })
}