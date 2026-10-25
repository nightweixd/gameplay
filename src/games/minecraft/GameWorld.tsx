
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { createWorld, executeStep, WORLD_MATERIALS as MATERIALS, FLOOR, pickBlock, playerCollides, type Agent, type Material, type Position, type Step } from './model'
import styles from './gameplay.module.css'
import { blockTexture, skinTexture } from './textures'
import { addScenery } from './scenery'
import { meshWorld, shadeCube } from './voxelMesh'
import { buildSkylight, type Skylight } from './skylight'

export type WorldControls = { capture: () => void; release: () => void; run: (steps: Step[]) => void; stop: () => void; resetAgent: () => void }
type Props = { active: boolean; material: Material; onLock: (locked: boolean) => void; onMessage: (message: string) => void; onRunning: (running: boolean) => void; onPosition: (player: Position, agent: Agent) => void; onError: (error: string) => void; onReady: () => void }
export default forwardRef<WorldControls, Props>(function GameWorld(props, ref) {
  const host = useRef<HTMLDivElement>(null)
  const callbacks = useRef(props)
  const api = useRef<WorldControls | null>(null)
  useEffect(() => { callbacks.current = props }, [props])
  useImperativeHandle(ref, () => ({
    capture: () => api.current?.capture(), release: () => api.current?.release(), run: steps => api.current?.run(steps), stop: () => api.current?.stop(), resetAgent: () => api.current?.resetAgent(),
  }), [])

  useEffect(() => {
    const container = host.current
    if (!container) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }) }
    catch { callbacks.current.onError('This browser could not start 3D graphics. Try a desktop browser with hardware acceleration enabled.'); return }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.setClearColor('#91b7e8'); renderer.toneMapping = THREE.NoToneMapping
    renderer.domElement.setAttribute('aria-label', 'First-person block world'); renderer.domElement.tabIndex = 0
    container.appendChild(renderer.domElement)
    const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#b1cdec', 38, 85)
    const skyGeometry = new THREE.SphereGeometry(95, 24, 16)
    const skyMaterial = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { horizon: { value: new THREE.Color('#b1cdec') }, zenith: { value: new THREE.Color('#6597dd') } }, vertexShader: 'varying vec3 skyDirection; void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'uniform vec3 horizon; uniform vec3 zenith; varying vec3 skyDirection; void main(){float height=max(0.0,normalize(skyDirection).y);gl_FragColor=vec4(mix(horizon,zenith,smoothstep(0.0,0.8,height)),1.0);\n#include <colorspace_fragment>\n}' })
    const sky = new THREE.Mesh(skyGeometry, skyMaterial); scene.add(sky)

    const camera = new THREE.PerspectiveCamera(70, 1, .05, 110); camera.rotation.order = 'YXZ'
    const world = createWorld(crypto.getRandomValues(new Uint32Array(1))[0])
    const player = { x: 0, y: .5, z: 7 }
    const agent: Agent = { x: 3, y: 1, z: 0, facing: 0 }
    const geometry = new THREE.BoxGeometry(1, 1, 1); shadeCube(geometry)
    const textures = MATERIALS.map(type => blockTexture(type))
    const materials = textures.map((map, index) => new THREE.MeshBasicMaterial({ map, vertexColors: true, alphaTest: MATERIALS[index] === 'leaves' || MATERIALS[index] === 'glass' ? .5 : 0 }))
    const grassTopTexture = blockTexture('grass', 'top'), logTopTexture = blockTexture('wood', 'top'), birchTopTexture = blockTexture('birch', 'top')
    const grassTop = new THREE.MeshBasicMaterial({ map: grassTopTexture, vertexColors: true }), logTop = new THREE.MeshBasicMaterial({ map: logTopTexture, vertexColors: true })
    const birchTop = new THREE.MeshBasicMaterial({ map: birchTopTexture, vertexColors: true })
    const birchFaces = [materials[9], materials[9], birchTop, birchTop, materials[9], materials[9]]
    const grassFaces = [materials[0], materials[0], grassTop, materials[1], materials[0], materials[0]]
    const woodFaces = [materials[4], materials[4], logTop, logTop, materials[4], materials[4]]
    const meshes = MATERIALS.map((type, index) => {
      const material = type === 'grass' ? grassFaces : type === 'wood' ? woodFaces : type === 'birch' ? birchFaces : materials[index]
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material); mesh.frustumCulled = false; scene.add(mesh); return mesh
    })
    const scenery = addScenery(scene, geometry, grassFaces, woodFaces, materials[5], world, birchFaces)
    const heldBlock = new THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[]>(geometry, grassFaces)
    heldBlock.position.set(.72, -.48, -.95); heldBlock.scale.set(.3, .3, .3); heldBlock.rotation.set(.12, -.6, .08)
    const skinTextures = [skinTexture('skin'), skinTexture('sleeve'), skinTexture('metal'), skinTexture('joint')]
    const handMaterial = new THREE.MeshBasicMaterial({ map: skinTextures[0], vertexColors: true, depthTest: false })
    const sleeveMaterial = new THREE.MeshBasicMaterial({ map: skinTextures[1], vertexColors: true, depthTest: false })
    const hand = new THREE.Mesh(geometry, handMaterial), sleeve = new THREE.Mesh(geometry, sleeveMaterial)
    hand.position.set(.76, -.65, -.82); hand.scale.set(.15, .32, .16); hand.rotation.z = -.35
    sleeve.position.set(.84, -.88, -.77); sleeve.scale.set(.17, .25, .18); sleeve.rotation.z = -.35
    const viewModel = new THREE.Group(); viewModel.add(heldBlock, hand, sleeve); camera.add(viewModel); scene.add(camera)
    let renderedVersion = -1
    let skylight: Skylight | null = null
    function refreshBlocks() {
      if (renderedVersion === world.version) return
      skylight = buildSkylight(world)
      const rebuilt = meshWorld(world, geometry, skylight)
      meshes.forEach((mesh, index) => { mesh.geometry.dispose(); mesh.geometry = rebuilt[index] })
      scenery.update(skylight); renderedVersion = world.version
    }
    refreshBlocks()
    const robot = new THREE.Group(); scene.add(robot)
    const robotMaterials = [new THREE.MeshBasicMaterial({ map: skinTextures[2], vertexColors: true }), new THREE.MeshBasicMaterial({ map: skinTextures[3], vertexColors: true }), new THREE.MeshBasicMaterial({ color: '#a6c8ce' }), new THREE.MeshBasicMaterial({ color: '#293b40' }), new THREE.MeshBasicMaterial({ color: '#ded2b0' })]
    function robotBox(size: number[], position: number[], material: number) {
      const mesh = new THREE.Mesh(geometry, robotMaterials[material]); mesh.scale.set(size[0], size[1], size[2]); mesh.position.set(position[0], position[1], position[2]); robot.add(mesh); return mesh
    }
    // Pale metal shell, dark joints and a front-facing visor, all cubic.
    robotBox([.58, .43, .47], [0, .21, 0], 0)
    robotBox([.49, .34, .4], [0, -.21, 0], 0)
    robotBox([.37, .2, .025], [0, -.19, .215], 1)
    robotBox([.13, .1, .03], [0, -.16, .235], 2)
    const leftLeg = robotBox([.18, .27, .23], [-.16, -.45, 0], 1), rightLeg = robotBox([.18, .27, .23], [.16, -.45, 0], 1)
    robotBox([.21, .1, .3], [-.16, -.53, .035], 0); robotBox([.21, .1, .3], [.16, -.53, .035], 0)
    const leftArm = robotBox([.14, .31, .2], [-.34, -.17, 0], 0), rightArm = robotBox([.14, .31, .2], [.34, -.17, 0], 0)
    robotBox([.43, .22, .025], [0, .21, .246], 1)
    robotBox([.12, .12, .03], [-.12, .23, .266], 2); robotBox([.12, .12, .03], [.12, .23, .266], 2)
    robotBox([.04, .06, .035], [-.11, .23, .284], 3); robotBox([.04, .06, .035], [.11, .23, .284], 3)
    robotBox([.35, .04, .035], [0, .39, .25], 4)
    const labelCanvas = document.createElement('canvas'); labelCanvas.width = 256; labelCanvas.height = 64
    const labelContext = labelCanvas.getContext('2d')!; labelContext.fillStyle = '#00000060'; labelContext.fillRect(12, 10, 232, 44); labelContext.fillStyle = '#ffffff'; labelContext.font = '22px GamePixel, monospace'; labelContext.textAlign = 'center'; labelContext.fillText('Agent', 128, 39)
    const labelTexture = new THREE.CanvasTexture(labelCanvas); const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture }); const label = new THREE.Sprite(labelMaterial); label.position.y = 1; label.scale.set(1.2, .3, 1); robot.add(label)
    robot.position.set(agent.x, agent.y, agent.z)
    const contactGeometry = new THREE.CircleGeometry(.37, 16)
    const contactMaterial = new THREE.MeshBasicMaterial({ color: '#182017', transparent: true, opacity: .22, depthWrite: false })
    const contact = new THREE.Mesh(contactGeometry, contactMaterial); contact.rotation.x = -Math.PI / 2; scene.add(contact)
    const outlineMaterial = new THREE.LineBasicMaterial({ color: '#111111' }); const outlineGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.006, 1.006, 1.006)); const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial); outline.visible = false; scene.add(outline)
    const cloudMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', vertexColors: true }); const clouds = new THREE.Group(); scene.add(clouds)
    for (let i = 0; i < 12; i++) {
      const x = Math.sin(i * 17) * 56, z = Math.cos(i * 11) * 56
      for (let part = 0; part < 3; part++) { const cloud = new THREE.Mesh(geometry, cloudMaterial); cloud.position.set(x + part * 3, 24, z + part % 2 * 2); cloud.scale.set(5 + i % 4, .65, 4); clouds.add(cloud) }
    }
    const sunMaterial = new THREE.MeshBasicMaterial({ color: '#fff9d5', fog: false })
    const sun = new THREE.Mesh(geometry, sunMaterial); sun.position.set(-42, 52, -60); sun.scale.set(7, 7, .2); sun.lookAt(0, 0, 0); scene.add(sun)
    const keys = new Set<string>()
    let yaw = 0, pitch = -.12, velocityY = 0, grounded = true, flying = false, disposed = false
    let freeLook = false, capturePending = false, captureVersion = 0
    let queue: Step[] = [], running = false, lastStep = 0, completed = 0, frame = 0, lastTime = performance.now(), lastPosition = 0
    const viewDirection = new THREE.Vector3()
    let heldMouse:number|null=null,lastEdit=0,actionTime=-1000
    let audioContext:AudioContext|null=null
    const fragments:{mesh:THREE.Mesh;velocity:THREE.Vector3;life:number}[]=[]
    const blockSound=(material:Material,breaking:boolean)=>{try{audioContext ??= new AudioContext();void audioContext.resume().catch(()=>{});const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;oscillator.type='triangle';oscillator.frequency.setValueAtTime(material==='glass'?620:material==='wood'||material==='planks'?180:100,now);oscillator.frequency.exponentialRampToValueAtTime(45,now+0.08);gain.gain.setValueAtTime(0.045,now);gain.gain.exponentialRampToValueAtTime(0.001,now+(breaking?0.12:0.08));oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+0.13);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()}}catch{/* Sound is optional. */}}
    const burst=(position:Position,material:Material)=>{const index=MATERIALS.indexOf(material);for(let i=0;i<8;i++){const mesh=new THREE.Mesh(geometry,materials[Math.max(0,index)]);mesh.scale.setScalar(0.07);mesh.position.set(position.x+(Math.random()-0.5)*0.7,position.y+(Math.random()-0.5)*0.7,position.z+(Math.random()-0.5)*0.7);scene.add(mesh);fragments.push({mesh,velocity:new THREE.Vector3((Math.random()-0.5)*2,Math.random()*2,(Math.random()-0.5)*2),life:0.5})}}

    function release() {
      captureVersion++; capturePending = false; keys.clear(); heldMouse=null; freeLook = false
      renderer.domElement.style.cursor = ''; callbacks.current.onLock(false)
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock()
    }
    const enableFreeLook = (version: number) => {
      if (disposed || version !== captureVersion || !capturePending) return
      capturePending = false; freeLook = true; renderer.domElement.style.cursor = 'none'
      callbacks.current.onLock(true); callbacks.current.onMessage('Move mouse to look · Esc to pause.')
    }
    const capture = () => {
      if (disposed) return
      renderer.domElement.focus({ preventScroll: true })
      if (document.pointerLockElement === renderer.domElement) { callbacks.current.onLock(true); return }
      const version = ++captureVersion; capturePending = true
      if (!renderer.domElement.requestPointerLock) { enableFreeLook(version); return }
      // Request synchronously inside the Play/Resume click to keep user activation.
      try { renderer.domElement.requestPointerLock()?.catch(() => enableFreeLook(version)) }
      catch { enableFreeLook(version) }
    }
    const lockError = () => enableFreeLook(captureVersion)
    const stop = () => { queue = []; running = false; callbacks.current.onRunning(false) }
    api.current = { capture, release, run: steps => { queue = [...steps]; running = !!steps.length; completed = 0; lastStep = 0; callbacks.current.onRunning(running) }, stop, resetAgent: () => { stop(); Object.assign(agent, { x: 3, y: 1, z: 0, facing: 0 }); if (world.get(agent)) { agent.y = 10 } } }
    callbacks.current.onReady()
    function lockChanged() {
      keys.clear();heldMouse=null
      if (document.pointerLockElement === renderer.domElement) {
        if (!capturePending) { document.exitPointerLock(); return }
        capturePending = false; freeLook = false; renderer.domElement.style.cursor = 'none'
      } else { freeLook = false; renderer.domElement.style.cursor = '' }
      callbacks.current.onLock(document.pointerLockElement === renderer.domElement)
    }
    function mouseMove(event: MouseEvent) {
      const locked = document.pointerLockElement === renderer.domElement
      if ((!locked && !(freeLook && event.target === renderer.domElement)) || !callbacks.current.active) return
      yaw -= event.movementX * .0024; pitch = THREE.MathUtils.clamp(pitch - event.movementY * .0024, -1.5, 1.5)
    }
    function keyDown(event: KeyboardEvent) {
      if (!callbacks.current.active || (document.pointerLockElement !== renderer.domElement && !freeLook)) return
      if (event.code === 'Escape' && freeLook) release()
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight'].includes(event.code)) { event.preventDefault(); keys.add(event.code) }
      if (event.code === 'KeyF' && !event.repeat) { flying = !flying; velocityY = 0; callbacks.current.onMessage(flying ? 'Flight on · Space to rise, Shift to descend.' : 'Flight off.') }
    }
    function keyUp(event: KeyboardEvent) { keys.delete(event.code) }
    function editBlock(button: number) {
      if(button!==0 && button!==2)return
      actionTime=performance.now();lastEdit=actionTime
      camera.getWorldDirection(viewDirection)
      const target = pickBlock(world, camera.position, viewDirection)
      if (!target) return
      if (button === 0) {const material=world.get(target.block);if(material && world.break(target.block)){burst(target.block,material);blockSound(material,true)}}
      if (button === 2) {
        const cell = target.adjacent
        if ((Math.abs(cell.x - player.x) < .8 && Math.abs(cell.z - player.z) < .8 && cell.y >= player.y - .5 && cell.y <= player.y + 1.7) || (cell.x === agent.x && cell.y === agent.y && cell.z === agent.z)) return
        if (world.place(cell, callbacks.current.material)) blockSound(callbacks.current.material,false);else callbacks.current.onMessage('No room to place that block.')
      }
    }
    function mouseDown(event: MouseEvent) {
      if (!callbacks.current.active) return
      if (freeLook) { heldMouse=event.button;editBlock(event.button); return }
      if (document.pointerLockElement !== renderer.domElement) { capture(); return }
      heldMouse=event.button;editBlock(event.button)
    }
    const mouseUp=()=>{heldMouse=null}
    const preventMenu = (event: MouseEvent) => event.preventDefault()
    const blur = () => { keys.clear(); release() }
    document.addEventListener('pointerlockchange', lockChanged); document.addEventListener('mousemove', mouseMove); document.addEventListener('pointerlockerror', lockError)
    window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp); window.addEventListener('blur', blur)
    window.addEventListener('mouseup',mouseUp);renderer.domElement.addEventListener('mousedown', mouseDown); renderer.domElement.addEventListener('contextmenu', preventMenu)
    const resize = () => { const width = container.clientWidth, height = container.clientHeight; renderer.setSize(width, height); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix() }
    const observer = new ResizeObserver(resize); observer.observe(container); resize()
    function tick(time: number) {
      if (disposed) return
      const dt = Math.min((time - lastTime) / 1000, .05); lastTime = time
      const active = callbacks.current.active
      if(active && heldMouse!==null && time-lastEdit>=200)editBlock(heldMouse)
      for(let i=fragments.length-1;i>=0;i--){const particle=fragments[i];particle.life-=dt;particle.velocity.y-=dt*8;particle.mesh.position.addScaledVector(particle.velocity,dt);particle.mesh.scale.setScalar(Math.max(0,particle.life)*0.14);if(particle.life<=0){scene.remove(particle.mesh);fragments.splice(i,1)}}
      if (active && (document.pointerLockElement === renderer.domElement || freeLook)) {
        let forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS')), sideways = Number(keys.has('KeyD')) - Number(keys.has('KeyA'))
        const length = Math.hypot(forward, sideways); if (length) { forward /= length; sideways /= length }
        const speed = keys.has('ShiftLeft') && !flying ? 7 : 4.5
        const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * sideways) * speed * dt
        const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * sideways) * speed * dt
        const xTarget = { ...player, x: THREE.MathUtils.clamp(player.x + dx, -22, 22) }
        if (!playerCollides(world, xTarget)) player.x = xTarget.x
        const zTarget = { ...player, z: THREE.MathUtils.clamp(player.z + dz, -22, 22) }
        if (!playerCollides(world, zTarget)) player.z = zTarget.z
        if (flying) velocityY = (Number(keys.has('Space')) - Number(keys.has('ShiftLeft') || keys.has('ShiftRight'))) * 4.5
        else { if (grounded && keys.has('Space')) { velocityY = 7; grounded = false } velocityY -= 20 * dt }
        const yTarget = { ...player, y: THREE.MathUtils.clamp(player.y + velocityY * dt, FLOOR + .5, 23) }
        if (!playerCollides(world, yTarget)) { player.y = yTarget.y; grounded = false }
        else { grounded = velocityY < 0; velocityY = 0 }
      }
      if (active && running && time - lastStep >= 280) {
        const step = queue.shift()
        if (step) {
          const error = executeStep(world, agent, step, { ...player, y: player.y + .5 }); completed++; lastStep = time
          if (error) { stop(); callbacks.current.onMessage(`Agent stopped at step ${completed}: ${error}`) }
        }
        if (!queue.length && running) { stop(); callbacks.current.onMessage(`Done! Your agent ran ${completed} steps.`) }
      }
      const entityBrightness = Math.pow(skylight?.brightness(agent) ?? 1, 2.2)
      for (const index of [0, 1]) robotMaterials[index].color.setRGB(entityBrightness, entityBrightness, entityBrightness)
      const robotMoving = robot.position.distanceToSquared(new THREE.Vector3(agent.x, agent.y, agent.z)) > .002
      const swing = robotMoving ? Math.sin(time * .02) * .3 : 0
      leftLeg.rotation.x = swing; rightLeg.rotation.x = -swing; leftArm.rotation.x = -swing; rightArm.rotation.x = swing
      let ground = FLOOR
      for (let y = Math.floor(agent.y - .5); y >= FLOOR; y--) if (world.get({ x: agent.x, y, z: agent.z })) { ground = y; break }
      contact.position.set(robot.position.x, ground + .505, robot.position.z)
      robot.position.lerp(new THREE.Vector3(agent.x, agent.y, agent.z), Math.min(1, dt * 12)); robot.rotation.y = -agent.facing * Math.PI / 2
      camera.position.set(player.x, player.y + 1.6 + (active && grounded && (keys.has('KeyW') || keys.has('KeyS') || keys.has('KeyA') || keys.has('KeyD')) ? Math.sin(time * .014) * .025 : 0), player.z); camera.rotation.set(pitch, yaw, 0, 'YXZ')
      viewModel.visible = active
      heldBlock.material = meshes[MATERIALS.indexOf(callbacks.current.material)].material
      const swingProgress=THREE.MathUtils.clamp((time-actionTime)/220,0,1),actionSwing=active?Math.sin(swingProgress*Math.PI):0
      viewModel.rotation.set(-actionSwing*0.45,-actionSwing*0.2,-actionSwing*0.2);viewModel.position.z=-actionSwing*0.13
      viewModel.position.y = active && (keys.has('KeyW') || keys.has('KeyA') || keys.has('KeyS') || keys.has('KeyD')) ? Math.sin(time * .009) * .015 : 0
      camera.getWorldDirection(viewDirection); const target = pickBlock(world, camera.position, viewDirection); outline.visible = !!target && active
      if (target) outline.position.set(target.block.x, target.block.y, target.block.z)
      sky.position.copy(camera.position); refreshBlocks(); clouds.position.x = Math.sin(time * .000015) * 4; renderer.render(scene, camera)
      if (time - lastPosition > 400) { callbacks.current.onPosition({ ...player }, { ...agent }); lastPosition = time }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      disposed = true; void audioContext?.close().catch(()=>{}); cancelAnimationFrame(frame); release(); api.current = null; observer.disconnect()
      document.removeEventListener('pointerlockchange', lockChanged); document.removeEventListener('mousemove', mouseMove); document.removeEventListener('pointerlockerror', lockError)
      window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp); window.removeEventListener('blur', blur)
      window.removeEventListener('mouseup',mouseUp);renderer.domElement.removeEventListener('mousedown', mouseDown); renderer.domElement.removeEventListener('contextmenu', preventMenu)
      meshes.forEach(mesh => mesh.geometry.dispose()); materials.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose())
      scenery.dispose(); skinTextures.forEach(texture => texture.dispose()); contactGeometry.dispose(); contactMaterial.dispose(); handMaterial.dispose(); sleeveMaterial.dispose(); skyGeometry.dispose(); skyMaterial.dispose(); sunMaterial.dispose(); robotMaterials.forEach(material => material.dispose()); birchTopTexture.dispose(); birchTop.dispose(); grassTopTexture.dispose(); logTopTexture.dispose(); grassTop.dispose(); logTop.dispose(); labelTexture.dispose(); labelMaterial.dispose(); outlineGeometry.dispose(); outlineMaterial.dispose(); cloudMaterial.dispose(); geometry.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [])
  return <div className={styles.world} ref={host} />
})
