export const isNear = (a: any, b: any, r = 2) =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= r * r;