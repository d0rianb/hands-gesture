// import { Camera } from '@mediapipe/camera_utils'
// import { Hands } from '@mediapipe/hands/hands.js'
import { Renderer, Interface, getWindowDimensions, Point } from 'unrail-engine'
import { setCanvasDimensions } from './utils'

const hands: Hands = new Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })

const videoElement: HTMLVideoElement = document.querySelector('.input-video')
let { width, height } = getWindowDimensions()
width = Math.min(width, height * 16 / 9)
setCanvasDimensions(document.querySelector('.canvas'), width, height)
const canvas: HTMLCanvasElement = Renderer.createFromCanvas('.canvas')

Interface.init()

let el = {
    x: width - 200,
    y: 200,
    width: 30, height: 30
}

hands.setOptions({
    maxNumHands: 2,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
})

hands.onResults(results => {
    Renderer.clear()
    Renderer.rect(el.x, el.y, el.width, el.height, { fillStyle: 'white' })
    if (results?.multiHandLandmarks) {
        for (let handPoints of results.multiHandLandmarks) {
            const pointArray: Array<Point> = handPoints.map(({ x, y }) => new Point(x * width, y * height))
            drawHand(pointArray)
            analyzeHand(pointArray)
        }
    }
    Renderer.endFrame()
})

function drawHand(pointArray: Array<Point>) {
    for (let { x, y } of pointArray) {
        Renderer.circle(x, y, 6, { lineWidth: 2 })
    }
    const horizontalLine: Array<Point> = [pointArray[2], pointArray[5]]
    let lastI = 0
    for (let i = 0; i <= pointArray.length; i++) {
        if (i === 5) {
            Renderer.poly(pointArray.slice(lastI, i))
            lastI = i
        } else if (lastI !== 0 && i == lastI + 4) {
            Renderer.poly(pointArray.slice(lastI, i))
            pointArray[i] && horizontalLine.push(pointArray[i])
            lastI = i
        }
    }
    Renderer.poly(horizontalLine)
}

function analyzeHand(pointArray: Array<Point>) {
    let color: string = 'black'
    const center: Point = pointArray[1].add(pointArray[13]).multiply(1 / 2).add(pointArray[2].add(pointArray[17]).multiply(1 / 2)).multiply(1 / 2)
    const insideCircleRadius: number = Math.min(center.dist(pointArray[0]), center.dist(pointArray[1]), center.dist(pointArray[2]), center.dist(pointArray[5]), center.dist(pointArray[13]), center.dist(pointArray[17]))
    const outsideCircleRadius: number = Math.max(pointArray[9].dist(pointArray[3]), pointArray[9].dist(pointArray[8]), pointArray[9].dist(pointArray[12]), pointArray[9].dist(pointArray[16]), pointArray[9].dist(pointArray[20]))
    const grab: boolean = !pointArray.find((point, index) => index > 4 && index % 4 == 0 && center.dist(point) > center.dist(pointArray[index - 2]))
    if (grab) color = 'red'
    if (grab && pointArray[9].dist(new Point(el.x, el.y)) < outsideCircleRadius) { el.x = pointArray[9].x, el.y = pointArray[9].y }
    Renderer.point(center.x, center.y)
    Renderer.circle(center.x, center.y, insideCircleRadius)
    Renderer.circle(pointArray[9].x, pointArray[9].y, outsideCircleRadius, { strokeStyle: color })
}

const camera: Camera = new Camera(videoElement, {
    onFrame: async () => await hands.send({ image: videoElement }),
    width,
    height
})

camera.start()