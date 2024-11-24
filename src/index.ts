import { ArxLightFlags } from 'arx-convert/types'
import { ArxMap, Color, Polygon, Settings, Vector3, Vertex } from 'arx-level-generator'
import { Triangle } from 'three'
import { createRootEntities } from './entities/entity.js'
import { createGameState } from './entities/gameState.js'
import { enhancePlayer } from './entities/player.js'
import { createRootSnakeTeleportDoor } from './entities/snakeTeleportDoor.js'
import { createLevel1 } from './places/levels/1/level1.js'
import { createLobby } from './places/lobby/lobby.js'

// import { createMeasurementRoom } from './places/measurementRoom/measurementRoom.js'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(2000, 0, 2000)

map.hud.hide('all')

await map.i18n.addFromFile('./i18n.json', settings)

// -----------------------

const gameState = createGameState()
map.entities.push(gameState)

map.player.withScript()
enhancePlayer(map.player, gameState)

map.entities.push(...createRootEntities())

const rootTeleport = createRootSnakeTeleportDoor()
map.entities.push(rootTeleport)

// -----------------------

const lobby = await createLobby(gameState, settings)
lobby.move(new Vector3(0, 1000, 0))
map.add(lobby, true)

const level1 = await createLevel1(gameState, settings)
level1.move(new Vector3(4000, 0, 8000))
map.add(level1, true)

// const measurementRoom = await createMeasurementRoom()
// map.add(measurementRoom, true)

gameState.script?.on('init', () => {
  return `
sendevent goto_lobby self nop
`
})

// -----------------------

/*
// custom light calculation

const lights = map.lights.filter((light) => {
  if ((light.flags & ArxLightFlags.Extinguishable) !== 0) {
    return false
  }

  return true
})

console.log(lights.length)

const verticesPerLight: { v: Vertex; p: Polygon }[][] = lights.map(() => [])

map.polygons.forEach((polygon) => {
  const isQuad = polygon.isQuad()
  const triangle1 = new Triangle(polygon.vertices[0], polygon.vertices[1], polygon.vertices[2])
  let triangle2 = undefined
  if (isQuad) {
    triangle2 = new Triangle(polygon.vertices[1], polygon.vertices[2], polygon.vertices[3])
  }

  polygon.vertices.slice(0, isQuad ? 4 : 3).forEach((vertex, vIdx) => {
    vertex.color = Color.black

    lights.forEach((light, lIdx) => {
      const distance = vertex.distanceTo(light.position)
      if (distance > light.fallEnd) {
        return
      }

      // if (vIdx < 3) {
      //   if (!triangle1.isFrontFacing(light.position)) {
      //     return
      //   }
      // } else {
      //   if (triangle2 !== undefined && !triangle2.isFrontFacing(light.position)) {
      //     return
      //   }
      // }

      verticesPerLight[lIdx].push({ v: vertex, p: polygon })
    })
  })
})

verticesPerLight.forEach((vertices, idx) => {
  const light = lights[idx]

  vertices.sort((a, b) => {
    const aD = a.v.distanceTo(light.position)
    const bD = b.v.distanceTo(light.position)
    return bD - aD
  })
})

const c = Color.white.multiplyScalar(0.1)
verticesPerLight.forEach((vertices, idx) => {
  const light = lights[idx]

  vertices.forEach(({ v }, i) => {
    // if (i === 0) {
    v.color.add(c)

    //   return
    // }

    // const intersectsAny = vertices.slice(0, i - 1).some(({ p }) => {
    //   const triangle1 = new Triangle(p.vertices[0], p.vertices[1], p.vertices[2])

    //   if (p.isQuad()) {
    //     const triangle2 = new Triangle(p.vertices[1], p.vertices[2], p.vertices[3])
    //   }
    // })
  })
})

// if (distance <= light.fallStart) {
//   vertex.color.add(light.color.multiplyScalar(light.intensity))
// }
*/

// -----------------------

map.finalize(settings)
map.saveToDisk(settings, true, true)
