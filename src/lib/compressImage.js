export function compressImage(file, { maxWidth = 1920, quality = 0.82, watermark = true } = {}) {
  return new Promise((resolve, reject) => {
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

        if (watermark) {
          const text = 'HOT INFO RD'
          const fontSize = Math.max(14, Math.round(width * 0.022))
          ctx.font = `700 ${fontSize}px sans-serif`
          ctx.textBaseline = 'bottom'

          const paddingX = fontSize * 0.9
          const paddingY = fontSize * 0.9
          const textWidth = ctx.measureText(text).width

          // Fondo semitransparente para que se lea sobre cualquier imagen
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
          ctx.fillRect(
            width - textWidth - paddingX * 2,
            height - fontSize - paddingY * 1.4,
            textWidth + paddingX * 2,
            fontSize + paddingY * 0.9
          )

          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
          ctx.fillText(text, width - textWidth - paddingX, height - paddingY * 0.5)
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo comprimir la imagen.'))
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