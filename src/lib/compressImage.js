export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Límite máximo de tamaño para web
        const MAX_WIDTH = 1200;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a formato moderno WebP con 80% de calidad
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Error al procesar la imagen"));
            return;
          }
          // Cambiar extensión a .webp
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const newFile = new File([blob], newName, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(newFile);
        }, "image/webp", 0.8);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}