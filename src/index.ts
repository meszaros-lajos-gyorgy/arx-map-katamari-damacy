import { ArxMap, Settings, Vector3 } from 'arx-level-generator'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(6000, 0, 6000)

// questions:
//   1. if I change the model of the player to a simple cube can it still move?
//   2. can a fix_inter be moved with an animation?

// POC goals:
//   - [ ] change the player's model to a cube or a sphere
//   - [ ] make the player move with it's new shape
//   - [ ] scatter random sized fix_inters with simple shapes, like cube or sphere
//   - [ ] make the fix_inters randomly move a bit
//   - [ ] enable collision for the fix_inters
//   - [ ] when the player touches a fix_inter that's smaller than the player's current size it should make the player grow and destroy (more like objecthide self) the touched fix_inter
//   - [ ] the player should not be able to "absorb" objects that are larger than himself
//   - [ ] there should be a very large fix_inter in the room (main boss), which's consumption is the goal
//   - [ ] make sure to give enough fix_inters to the map to allow the player to grow past the main boss
//   - [ ] there should also be a time limit to how soon the main boss needs to be absorbed
//   - [ ] display the remaining time on screen in some way
//   - [ ] allow the player to restart the map as many times as he wants, the game should not have the usual round of start new game - credits screen loop, more like what sven-coop has

map.finalize(settings)
map.saveToDisk(settings)
