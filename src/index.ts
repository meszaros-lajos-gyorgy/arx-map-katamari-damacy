import { ArxMap, HudElements, Settings, Vector3 } from 'arx-level-generator'
import { createRootEntities } from './entities/entity.js'
import { createGameState } from './entities/gameState.js'
import { enhancePlayer } from './entities/player.js'
import { createLevel01 } from './places/levels/01/level01.js'

// import { createMeasurementRoom } from './places/measurementRoom/measurementRoom.js'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(4000, 0, 4000)

map.hud.hide(HudElements.Minimap)
map.hud.hide(HudElements.HerosayIcon)

await map.i18n.addFromFile('./i18n.json', settings)

// -----------------------

const gameState = createGameState()
map.entities.push(gameState)

map.player.withScript()
enhancePlayer(map.player, gameState)

map.entities.push(...createRootEntities())

// -----------------------

const level01 = createLevel01(gameState)
map.add(level01, true)

// const measurementRoom = createMeasurementRoom()
// map.add(measurementRoom, true)

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
