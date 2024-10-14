import { ArxMap, Settings, Vector3 } from 'arx-level-generator'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(6000, 0, 6000)

map.finalize(settings)
map.saveToDisk(settings)
