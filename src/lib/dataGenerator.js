import math from "./math.js";

export function getVehicles() {
  const data = [];
  const N = 1000;
  for (let i = 1; i <= N; i++) {
    //50/50 probability of being a sport vehicle or a basic one
    const type = Math.random() < 0.5 ? "sport" : "basic";
    const km = math.lerp(3000, 300000, Math.random());
    //const t = math.inverseLerp(300, 300000, km);
    //price depends on km, so we use an inverse lerp calculation that returns a t value to be used in the
    //price calculation based on the km calculated above
    //This is called remapping
    //const price = math.lerp(9000, 900, t);

    const price =
      math.remap(3000, 300000, 9000, 900, km) +
      math.lerp(-2000, 2000, Math.random()) +
      (type === "sport" ? 5000 : 0); // we add variants

    data.push({
      id: i,
      label: type,
      point: [math.format(km), math.format(price)],
    });
  }
  return data;
}
