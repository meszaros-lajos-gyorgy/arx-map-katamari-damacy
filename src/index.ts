import { ArxMap, Settings, Vector3 } from 'arx-level-generator'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { createRootEntities } from './entities/entity.js'
import { createGameState } from './entities/gameState.js'
import { enhancePlayer } from './entities/player.js'
import { createLevel01 } from './places/levels/01/level01.js'

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

// -----------------------

const level01 = createLevel01(gameState, settings)
level01.move(new Vector3(8000, 0, 8000))
map.add(level01, true)

// const measurementRoom = createMeasurementRoom()
// map.add(measurementRoom, true)

gameState.script?.on('init', () => {
  const { delay } = useDelay()
  return `${delay(300)} sendevent goto_level01 self nop`
})

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
