import type { Building } from "../types";

export const BUILDINGS: Building[] = [
  {
    points: [
      [2, 2], // top-left
      [22, 2], // top-right
      [22, 12], // bottom-right
      [2, 11], // bottom-left
    ],
  },
  {
    points: [
      [2, 2],
      [7, 2],
      [8, 27],
      [3, 27],
    ],
  },
  {
    points: [
      [2, 18],
      [18, 18],
      [18, 27],
      [2, 27],
    ],
  },
  {
    points: [
      [32, 3],
      [52, 3],
      [53, 12],
      [32, 12],
    ],
  },
  {
    points: [
      [47, 12],
      [53, 12],
      [53, 27],
      [47, 27],
    ],
  },
  {
    points: [
      [36, 18],
      [53, 18],
      [53, 27],
      [36, 27],
    ],
  },
];

const pointInBuilding = (x: number, y: number, b: Building) => {
  const xs = b.points.map((p) => p[0]);
  const ys = b.points.map((p) => p[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return x >= minX && x < maxX && y >= minY && y < maxY;
};

export const isBlocked = (x: number, y: number) =>
  BUILDINGS.some((b) => pointInBuilding(x, y, b));
