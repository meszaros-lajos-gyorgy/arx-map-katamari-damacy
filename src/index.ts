import { ArxMap, HudElements, Settings, Vector3 } from 'arx-level-generator'
import { isBetween } from 'arx-level-generator/utils'
import { pickWeightedRandoms, randomBetween } from 'arx-level-generator/utils/random'
import { createEntity, createRootEntities, EntityTypes } from './entities/entity.js'
import { createGameState } from './entities/gameState.js'
import { enhancePlayer } from './entities/player.js'
import { createMap1 } from './places/map1/map1.js'

// import { createMeasurementRoom } from './places/measurementRoom/measurementRoom.js'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(4000, 0, 4000)

map.hud.hide(HudElements.Minimap)
map.hud.hide(HudElements.HerosayIcon)

await map.i18n.addFromFile('./i18n.json', settings)

// -----------------------

const map1 = createMap1()
map.add(map1, true)

// const measurementRoom = createMeasurementRoom()
// map.add(measurementRoom, true)

// -----------------------

const gameState = createGameState()
map.entities.push(gameState)

map.player.withScript()
enhancePlayer(map.player, gameState)

map.entities.push(...createRootEntities())

// -----------------------

function createRandomPosition() {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }
  return position
}

const npcDistribution = [
  { value: EntityTypes.Ylside, weight: 10 },
  { value: EntityTypes.Carrot, weight: 20 },
  { value: EntityTypes.Leek, weight: 20 },
  { value: EntityTypes.GoblinLord, weight: 30 },
  { value: EntityTypes.Goblin, weight: 60 },
]

const smalls = pickWeightedRandoms(100, npcDistribution)
const mediums = pickWeightedRandoms(50, npcDistribution)
const larges = pickWeightedRandoms(30, npcDistribution)
const extraLarges = pickWeightedRandoms(7, npcDistribution)

map.entities.push(
  ...smalls.map(({ value }) => {
    return createEntity({
      position: createRandomPosition(),
      size: randomBetween(20, 50),
      type: value,
    })
  }),
  ...mediums.map(({ value }) => {
    return createEntity({
      position: createRandomPosition(),
      size: randomBetween(40, 125),
      type: value,
    })
  }),
  ...larges.map(({ value }) => {
    return createEntity({
      position: createRandomPosition(),
      size: randomBetween(100, 250),
      type: value,
    })
  }),
  ...extraLarges.map(({ value }) => {
    return createEntity({
      position: createRandomPosition(),
      size: randomBetween(200, 300),
      type: value,
    })
  }),
)

// -----------------------

const boss = createEntity({
  position: createRandomPosition(),
  size: 300,
  type: EntityTypes.GoblinKing,
})
boss.script?.on('consumed', () => {
  return `sendevent victory ${gameState.ref} nop`
})
map.entities.push(boss)

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
