import * as THREE from 'three'
import GUI  from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * Debug Panel
 */
const gui = new GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Test Plane
 */
// const geo = new THREE.PlaneGeometry(10, 10)
// const mat = new THREE.MeshBasicMaterial({ 
//     color: 0xffff00,
//     side: THREE.DoubleSide
//  })
// const plane = new THREE.Mesh(geo, mat)
// plane.rotation.x = - Math.PI * 0.5
// scene.add(plane)

/**
 * Test Retro Grid
 */
const division = 20
const limit = 100
const grid = new THREE.GridHelper(limit * 2, division, 0xffff00, 0xffff00)

const moveable = new Uint8Array(division * division)
for (let i = 0; i <= moveable.length; i++) {
    moveable[i] = Math.random() > 0.5 ? 1 : 0
}

const moveableAttribute = new THREE.BufferAttribute(new Uint8Array(moveable, 1))

grid.geometry.setAttribute('moveable', moveableAttribute)

grid.material = new THREE.ShaderMaterial({
    uniforms: {
        time: {
            value: 0
        },
        limits: {
            value: new THREE.Vector2(-limit, limit)
        },
        speed: {
            value: 5
        }
    },
    vertexShader: `
        uniform float time;
        uniform vec2 limits;
        uniform float speed;

        attribute vec3 color;
        attribute float moveable;

        varying vec3 vColor;

        void main() {
            vColor = color;
            float limLen = limits.y - limits.x;
            vec3 pos = position;
            if (floor(moveable + 0.5) > 0.5) { 
                float dist = speed * time;
                float currPos = mod((pos.z + dist) - limits.x, limLen) + limits.x;
                pos.z = currPos;
              } 
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `,
})
grid.material.vertexColors = THREE.VertexColors

scene.add(grid)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

// Updates
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
    75, 
    sizes.width / sizes.height, 
    0.1, 
    1000
)
camera.position.set(-3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()