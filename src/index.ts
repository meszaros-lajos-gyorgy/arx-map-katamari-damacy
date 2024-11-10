import { ArxMap, Settings, Vector3 } from 'arx-level-generator'
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
level1.move(new Vector3(8000, 0, 8000))
map.add(level1, true)

// const measurementRoom = await createMeasurementRoom()
// map.add(measurementRoom, true)

gameState.script?.on('init', () => {
  return `
sendevent goto_lobby self nop
`
})

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
