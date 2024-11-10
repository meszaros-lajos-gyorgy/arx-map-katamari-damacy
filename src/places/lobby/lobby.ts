import { Ambience, ArxMap, Color, Entity, Rotation, Settings, Vector3 } from 'arx-level-generator'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { PlayerControls } from 'arx-level-generator/scripting/properties'
import { createLight, createZone } from 'arx-level-generator/tools'
import { createSnakeTeleportDoor } from '@/entities/snakeTeleportDoor.js'
import { createTeleport } from '@/meshPrefabs/teleport.js'
import { snakeTeleportSoundScript } from '@/sounds.js'

export async function createLobby(gameState: Entity, settings: Settings): Promise<ArxMap> {
  const map = new ArxMap()

  const teleport = await createTeleport(settings)
  map.polygons.push(...teleport)

  const teleportToLevel1 = createSnakeTeleportDoor({
    position: new Vector3(230, 0, 0),
    orientation: new Rotation(0, 0, 0),
  })

  teleportToLevel1.script
    ?.on('init', () => {
      return `
setname [teleport_to_level1]
tweak skin fix_inter_shot_0 fix_inter_shot_11
`
    })
    .on('action', () => {
      const { delay } = useDelay()
      if (settings.mode === 'production') {
        return `
${PlayerControls.off}
worldfade out 2500 ${Color.white.toScriptColor()}
${snakeTeleportSoundScript.play()} ${delay(2500)} sendevent goto_level1 ${gameState.ref} nop
`
      } else {
        return `
sendevent goto_level1 ${gameState.ref} nop
`
      }
    })
  map.entities.push(teleportToLevel1)

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
    position: new Vector3(200, -500, 200),
    radius: 800,
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
