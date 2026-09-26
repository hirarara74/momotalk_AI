import i18n from '@/locales/i18n'

export const MAX_IMAGE_FILE_SIZE = 25 * 1024 * 1024 // 25MB

export const validateImageFileSize = (size: number, maxBytes: number = MAX_IMAGE_FILE_SIZE): boolean => {
    return size <= maxBytes
}

const fileToDataURL = (file: Blob): Promise<any> => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = (e) => resolve((e.target as FileReader).result)
        reader.readAsDataURL(file)
    })
}

const dataURLToImage = (dataURL: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.src = dataURL
    })
}

const canvastoFile = (
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
): Promise<Blob | null> => {
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality))
}

export const compressionFile = async (file: File, quality = 0.75, maxDimension = 1600): Promise<File> => {
    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    const base64 = await fileToDataURL(file)
    const img = await dataURLToImage(base64)

    let { width, height } = img
    if (width > maxDimension || height > maxDimension) {
        if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
        } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
        }
    }

    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    context.drawImage(img, 0, 0, width, height)
    const blob = ((await canvastoFile(canvas, 'image/webp', quality)) || file) as Blob
    return new File([blob], fileName, { type: 'image/webp' })
}

const readFile = (reader: FileReader) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
        const file = input.files?.[0]
        if (file) {
            if (!validateImageFileSize(file.size)) {
                alert(i18n.global.t('imageUploadAlert'))
                return
            }
            try {
                const webp = await compressionFile(file)
                reader.readAsDataURL(webp)
            } catch (err) {
                console.error('Image compression failed, using original file:', err)
                reader.readAsDataURL(file)
            }
        }
    }
    input.click()
}

export { readFile }
