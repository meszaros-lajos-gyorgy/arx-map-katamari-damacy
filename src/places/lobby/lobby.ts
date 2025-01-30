import { $, Ambience, ArxMap, Color, Entity, QUADIFY, Rotation, ISettings, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Label, PlayerControls } from 'arx-level-generator/scripting/properties'
import { createLight, createZone } from 'arx-level-generator/tools'
import { circleOfVectors } from 'arx-level-generator/utils'
import { MathUtils, Vector2 } from 'three'
import { createSnakeTeleportDoor } from '@/entities/snakeTeleportDoor.js'
import { altitudeFromSide, sideFromAltitude } from '@/helpers/isosceles.js'
import { createTeleport } from '@/meshPrefabs/teleport.js'
import { snakeTeleportSoundScript } from '@/sounds.js'

const defaultNumberOfPortals = 8
// measured this for 8 portals
const defaultPortalDistanceFromCenter = 230.3

const widthOfAPortal = sideFromAltitude(
  defaultPortalDistanceFromCenter,
  MathUtils.degToRad(360 / defaultNumberOfPortals),
)

export async function createLobby(gameState: Entity, settings: ISettings): Promise<ArxMap> {
  const map = new ArxMap()

  const numberOfPortals = 8
  const teleportPosition = new Vector3(0, -1, 500)

  const floor = createPlaneMesh({
    size: new Vector2(1000, 1600),
    tileSize: 35,
  })
  floor.position.add(teleportPosition.clone().divideScalar(1.5))
  map.polygons.addThreeJsMesh(floor, { tryToQuadify: QUADIFY })
  $(map.polygons)
    .selectBy((polygon) => {
      return polygon.vertices.some((vertex) => {
        return vertex.distanceTo(teleportPosition) < 250
      })
    })
    .delete()

  const teleport = await createTeleport(settings, numberOfPortals)
  $(teleport).selectAll().move(teleportPosition)
  map.polygons.push(...teleport)

  const portalDistanceFromCenter = altitudeFromSide(widthOfAPortal, MathUtils.degToRad(360 / numberOfPortals))
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

  const spawnLobby = Entity.marker
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
    position: new Vector3(200, -500, 200).add(teleportPosition),
    radius: 1000,
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
