import { $, ArxMap, Polygons, type Settings, Vector3 } from 'arx-level-generator'
import { Box3 } from 'three'

let cache: Polygons | undefined = undefined

export async function createTeleport(settings: Settings, numberOfPortals: number): Promise<Polygons> {
  if (cache === undefined) {
    const city = await ArxMap.fromOriginalLevel(11, settings)

    const selection = $(city.polygons)
      .selectWithinBox(new Box3(new Vector3(10060, 1000, 6400), new Vector3(10851, 1650, 7300)))
      .copy()
      .selectAll()
      .moveToRoom1()
      .move(new Vector3(-10450, -1575, -6850))

    selection.clearSelection().selectByTextures(['[stone]_human_stone_ornament']).delete()

    selection
      .clearSelection()
      .selectBy(({ texture }) => {
        if (texture === undefined) {
          return true
        }

        return texture.filename.startsWith('[soil]_') || texture.filename.startsWith('[stone]_')
      })
      .delete()

    cache = selection.selectAll().get()
  }

  return $(cache).selectAll().copy().get()
}

/*
floor inner:      l5_snake_[stone]_tele1
floor outer ring: l5_snake_[marble]_wall06, ...wall07, ...wall08, ...wall09
floor rim:        l5_snake_[marble]_wall11
*/
