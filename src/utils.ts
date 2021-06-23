// To be remove, this function will soon be included
// in the unrail-engine (version >= 0.4.8)
export function setCanvasDimensions(canvas: HTMLCanvasElement, width: number, height: number, pixelRatio?: number): void {
    canvas.width = width * (pixelRatio || window.devicePixelRatio || 1)
    canvas.height = height * (pixelRatio || window.devicePixelRatio || 1)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    canvas.getContext('2d')!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}