import Router from "express";
import { userMiddleware } from "../../middlewares/user";
import { SpaceSchema } from "../../types";
import { prisma } from "../../lib/prisma";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parsed = SpaceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      messsage: "Validation Error",
    });
    return;
  }
  if (!parsed.data.mapId) {
    const space = await prisma.space.create({
      data: {
        name: parsed.data.name,
        width: parseInt(parsed.data.dimensions.split("x")[0]),
        height: parseInt(parsed.data.dimensions.split("x")[1]),
        creatorId: req.userId!,
      },
    });
    res.json({ spaceId: space.id });
    return;
  }

  const map = await prisma.map.findFirst({
    where: {
      id: parsed.data.mapId,
    },
    select: {
      mapElements: true,
      width: true,
      height: true,
    },
  });
  if (!map) {
    res.status(400).json({ message: "Map Not Found" });
    return;
  }
  let space = await prisma.$transaction(async () => {
    const space = await prisma.space.create({
      data: {
        name: parsed.data.name,
        width: map.width,
        height: map.height,
        creatorId: req.userId!,
      },
    });

    await prisma.spaceElement.createMany({
      data: map.mapElements.map((e) => ({
        spaceId: space.id,
        elementId: e.elementId,
        x: e.x!,
        y: e.y!,
      })),
    });
    return space;
  });
  res.json({ spaceId: space.id });
});
