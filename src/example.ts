export const example = `Coal liquefaction
No modules or beacons. Rates per second.

Refineries and recipe time
refineries = 10 =
recipe_seconds = 5 =
cycles = refineries / recipe_seconds =

Keep 25 heavy oil for the next cycle.
heavy = (90 - 25) * cycles =
light = 20 * cycles =
gas = 10 * cycles =
coal = 10 * cycles =

Crack the excess heavy oil (40 → 30).
heavy_plants = heavy / (40 / 2) =
light_total = light + heavy * 30 / 40 =

Crack all light oil (30 → 20).
light_plants = light_total / (30 / 2) =
gas_total = gas + light_total * 20 / 30 =

Round up to whole chemical plants.
ceil(heavy_plants) =
ceil(light_plants) =

Petroleum gas per coal
gas_total / coal =`;
