import {
  $,
  Ambience,
  ArxMap,
  Color,
  Entity,
  QUADIFY,
  Rotation,
  type Settings,
  Texture,
  Vector3,
} from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Label, PlayerControls } from 'arx-level-generator/scripting/properties'
import { createLight, createZone } from 'arx-level-generator/tools'
import { makeBumpy } from 'arx-level-generator/tools/mesh'
import { circleOfVectors } from 'arx-level-generator/utils'
import { MathUtils, Vector2 } from 'three'
import { createSnakeTeleportDoor } from '@/entities/snakeTeleportDoor.js'
import { createTeleport } from '@/meshPrefabs/teleport.js'
import { snakeTeleportSoundScript } from '@/sounds.js'

const numberOfPortals = 8
const portalDistanceFromCenter = 230.3

export async function createLobby(gameState: Entity, settings: Settings): Promise<ArxMap> {
  const map = new ArxMap()

  const teleportPosition = new Vector3(0, -1, 1000)

  const floor = createPlaneMesh({
    size: new Vector2(1600, 2500),
    tileSize: 35,
    texture: new Texture({
      filename: 'L1_DRAGON_[ICE]_ICEGROUND02.jpg',
      height: 128,
    }),
  })

  makeBumpy([0, 10], 75, true, floor.geometry)

  floor.position.add(teleportPosition.clone().divideScalar(1.5))
  map.polygons.addThreeJsMesh(floor, { tryToQuadify: QUADIFY })
  $(map.polygons)
    .selectBy((polygon) => {
      return polygon.vertices.some((vertex) => {
        return vertex.distanceTo(teleportPosition) < 230
      })
    })
    .delete()

  const teleport = await createTeleport(settings, numberOfPortals)
  $(teleport).selectAll().move(teleportPosition)
  map.polygons.push(...teleport)

  const teleportDoorLocations = circleOfVectors(
    teleportPosition,
    portalDistanceFromCenter,
    numberOfPortals,
    MathUtils.degToRad(180),
  )

  teleportDoorLocations.slice(0, 1).forEach((position, i) => {
    const teleportDoor = createSnakeTeleportDoor({
      position,
      orientation: new Rotation(0, MathUtils.degToRad(-90 - i * (360 / teleportDoorLocations.length)), 0),
    })

    teleportDoor.script?.properties.push(new Label(`[teleport_to_level${i}]`))

    teleportDoor.script
      ?.on('init', () => {
        // TODO: set different images based on the value of i
        // TODO: set custom images
        return `tweak skin fix_inter_shot_0 fix_inter_shot_11`
      })
      .on('action', () => {
        const { delay } = useDelay()
        if (settings.mode === 'production') {
          return `
${PlayerControls.off}
worldfade out 2500 ${Color.white.toScriptColor()}
${snakeTeleportSoundScript.play()} ${delay(2500)} sendevent goto_level${i + 1} ${gameState.ref} nop
`
        } else {
          return `
sendevent goto_level${i + 1} ${gameState.ref} nop
`
        }
      })

    map.entities.push(teleportDoor)
  })

  // ---------------------

  const spawnZoneLobby = createZone({
    name: 'lobby_spawn',
    size: new Vector3(100, 100, 100),
    backgroundColor: Color.black,
    ambience: Ambience.none,
    drawDistance: 7000,
  })
  map.zones.push(spawnZoneLobby)

  const spawnLobby = Entity.marker.at({ position: new Vector3(0, 0, -250) })
  map.entities.push(spawnLobby)

  gameState.script?.on('goto_lobby', () => {
    return `
teleport -p ${spawnLobby.ref}
sendevent setsize player 180

${PlayerControls.on}
`
  })

  // ---------------------

  const light = createLight({
    position: teleportPosition.clone().add(new Vector3(0, -300, 0)),
    radius: 600,
    intensity: 2,
  })
  map.lights.push(light)

  // ---------------------

  gameState.script?.on('init', () => {
    return `
sendevent setsize player 180
`
  })

  // ---------------------

  return map
}
