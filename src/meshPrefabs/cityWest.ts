import { $, ArxMap, Settings, Vector3 } from 'arx-level-generator'
import { Box3 } from 'three'

export async function createCityWest(settings: Settings): Promise<ArxMap> {
  const city = await ArxMap.fromOriginalLevel(11, settings)

  const areaOfSelection = new Box3(new Vector3(2000, -1000, 4000), new Vector3(7000, 3000, 11000))
  const offset = new Vector3(-5000, -2000, -8000)

  const map = new ArxMap()

  const polygons = $(city.polygons)
    .selectWithinBox(areaOfSelection.clone())
    .copy()
    .selectAll()
    .moveToRoom1()
    .move(offset)
    .get()
  for (let i = 0; i < polygons.length; i++) {
    map.polygons.push(polygons[i])
  }

  const lights = $(city.lights)
    .selectAll()
    .move(city.config.offset)
    .selectWithinBox(areaOfSelection)
    .copy()
    .selectAll()
    .move(offset.clone())
    .get()
  for (let i = 0; i < lights.length; i++) {
    map.lights.push(lights[i])
  }

  return map
}
