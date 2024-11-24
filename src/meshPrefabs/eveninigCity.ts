import { ArxLightFlags } from 'arx-convert/types'
import { $, ArxMap, Settings, Vector3 } from 'arx-level-generator'
import { Variable } from 'arx-level-generator/scripting/properties'
import { Box3 } from 'three'
import { eveningSky } from '@/colors.js'

export async function createEveningCity(settings: Settings): Promise<ArxMap> {
  const city = await ArxMap.fromOriginalLevel(11, settings)

  const offset = new Vector3(-5000, -2000, -8000)

  const map = new ArxMap()

  map.polygons = $(city.polygons).selectAll().moveToRoom1().move(offset).get()

  const lightBBox = new Box3()
  const lightPositions: Vector3[] = []

  // // csak a debug miatt adjuk vissza
  // map.lights =
  $(city.lights)
    .selectAll()
    .move(city.config.offset)
    .move(offset)
    .selectBy((light) => {
      return (light.flags & ArxLightFlags.Extinguishable) === 0
    })
    // // ------------debug
    // .copy()
    // .get()

    // console.log(map.lights.length)
    // -----------------
    .apply((light) => {
      light.color = eveningSky
      lightBBox.expandByPoint(light.position)
      lightPositions.push(light.position)
    })

  let focus = lightBBox.max
  let [min] = lightPositions.splice(0, 1)
  let minDistance = min.distanceTo(focus)
  let max = min
  let maxDistance = minDistance
  lightPositions.forEach((lightPos) => {
    let distance = lightPos.distanceTo(focus)
    if (distance < minDistance) {
      min = lightPos
      minDistance = distance
    } else if (distance > maxDistance) {
      max = lightPos
      maxDistance = distance
    }
  })
  const diff = maxDistance - minDistance

  map.lights = $(city.lights)
    .apply((light) => {
      const scaling = light.position.distanceTo(min) / diff
      light.intensity *= scaling
    })
    .get()

  map.entities = $(city.entities)
    .selectBy((entity) => {
      if (entity.entityName === 'light_door') {
        // we keep all the doors, except:
        // 6, 57 - secret doors in gary's bank
        if (entity.id === 6 || entity.id === 57) {
          return false
        }

        return true
      }

      return false
    })
    .copy()
    .selectAll()
    .apply((entity) => {
      if (entity.entityName === 'light_door') {
        const varUnlock = new Variable('bool', 'unlock', true)
        const varType = new Variable<string>('string', 'type', '')

        entity.withScript()

        switch (entity.id) {
          // 19 - maria's store
          // 20 - leave me alone door (left)
          // 21 - leave me alone door (right)
          // 22 - tafiok's jewellery
          // 23 - alicia's home
          // 24 - tafiok's home
          // 29 - side door on the way to gary's apartment
          case 19:
          case 20:
          case 21:
          case 22:
          case 23:
          case 24:
          case 29: {
            varType.value = 'door_city_unbreak'
            entity.script?.on('load', () => `use_mesh "door_city/door_city.teo"`)
            break
          }

          // 94 - priest's quarters' door in church
          case 94: {
            varType.value = 'door_city_unbreak'
            entity.script?.on('load', () => `use_mesh "Door_Human_Palace_light/Door_Human_Palace_light.teo"`)
            break
          }

          // 93 - church side door at castle entrance
          // 95 - church exit at city entrance
          case 93:
          case 95: {
            varType.value = 'door_city_unbreak'
            entity.script?.on('load', () => `use_mesh "Door_church02/Door_church02.teo"`)
            break
          }
          // 96 - church double door
          case 96: {
            varType.value = 'door_metal_double'
            entity.script?.on('load', () => `use_mesh "Door_Church_double_door/Door_Church_double_door.teo"`)
            break
          }
          // 99 - enoil's home
          case 99: {
            varType.value = 'door_city_unbreak'
            entity.script?.on('load', () => `use_mesh "door_city/door_city.teo"`)
            break
          }

          // 104 - gary's apartment
          case 104: {
            varType.value = 'door_city_unbreak'
            entity.script?.on('load', () => `use_mesh "door_castle/door_castle.teo"`)
            break
          }
          // 28 - miguel's smithy
          // 101 - gary's bank back door
          // 103 - gary's bank door
          // 105 - carlo's guardpost door
          case 28:
          case 101:
          case 103:
          case 105: {
            varType.value = 'door_fullmetal'
            entity.script?.on('load', () => `use_mesh "Door_Human_Palace_metal/Door_Human_Palace_metal.teo"`)
            break
          }
          // 106 - city entrance
          // 118 - castle entrance
          case 106:
          case 118: {
            varType.value = 'door_metal_double'
            entity.script?.on('load', () => `use_mesh "Door_Castle_double_door/Door_Castle_double_door.teo"`)
            break
          }
          // 98 - door to sewer escape house
          // 100 - home next to gary's bank back door
          // 102 - door opposite of gary's bank
          // 121 - fisherman's hut
          case 98:
          case 100:
          case 102:
          case 121: {
            break
          }
        }

        entity.script?.properties.push(varUnlock)
        if (varType.value !== '') {
          entity.script?.properties.push(varType)
        }
      }
    })
    .move(city.config.offset)
    .move(offset)
    .get()

  return map
}
