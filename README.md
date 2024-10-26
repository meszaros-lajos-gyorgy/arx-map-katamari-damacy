# Blob absorb map for Arx Fatalis

A map where you control a blob that grows by consuming smaller blobs upon collision

**Compatible with
[Arx Libertatis Mod Manager](https://github.com/fredlllll/ArxLibertatisModManager)**

![Preview](preview.jpg?raw=true 'Preview')

Check out other maps and mods for Arx Fatalis here: [arx-tools.github.io](https://arx-tools.github.io/)

---

## questions:

1. if I change the model of the player to a simple cube can it still move?
2. can a fix_inter be moved with an animation?

## POC goals:

- [ ] change the player's model to a cube or a sphere
- [ ] can a cube/sphere be placed a bit ahead of the player instead like in Katamari?
- [ ] make the player move with it's new shape
- [x] scatter random sized enemies
- [ ] make the enemies randomly move a bit (maybe with anchors?)
- [x] enable collision for the enemies
- [x] when the player touches a enemy that's smaller than the player's current size it should make the player grow and destroy (more like objecthide self) the touched enemy
- [x] the player should not be able to "absorb" objects that are larger than himself
- [x] there should be a very large enemy in the room (main boss), which's consumption is the goal
- [x] make sure to give enough enemies to the map to allow the player to grow past the main boss
- [ ] there should also be a time limit to how soon the main boss needs to be absorbed
- [ ] display the remaining time on screen in some way
- [ ] allow the player to restart the map as many times as he wants, the game should not have the usual round of start new game - credits screen loop, more like what sven-coop has
- [ ] make the NPCs invulnerable and not react to attacks
