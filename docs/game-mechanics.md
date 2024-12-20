# Game mechanics

_(for programmers or anyone interested in the internal logic)_

Each entity that's on the map and can be consumed have the same code under the
hood. Every entity is an NPC, even carrots and non-animate objects, as Arx only
supports collision detection for NPCs.

## Height normalization

Entities have a pre-determined height measured in centimeters. Every model has
a different height, so they were measured next to a standardized block in
places/measurementRoom.ts

Models that are partially underground only the part that is above ground
measured.

The end result is every model having the same height when their size variable
is set to 100:

![Everything leveled](img/normalized-height.jpg?raw=true 'Everything leveled')
