import Router from "express";
import { adminMiddleware } from "../../middlewares/admin";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "../../types";
import { prisma } from "../../lib/prisma";
export const adminRouter = Router();

adminRouter.use(adminMiddleware);

adminRouter.post("/element", async (req, res) => {
  const parsedData = CreateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Vaidation Error",
    });
    return;
  }
  try {
    const element = await prisma.element.create({
      data: {
        width: parsedData.data.width,
        height: parsedData.data.height,
        static: parsedData.data.static,
        imageUrl: parsedData.data.imageUrl,
      },
    });
    res.status(200).json({
      id: element.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
});

adminRouter.put("/element/:elementId", async (req, res) => {
  const parsedData = UpdateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Validation Error",
    });
    return;
  }
  const element = await prisma.element.update({
    where: {
      id: req.params.elementId,
    },
    data: { imageUrl: parsedData.data.imageUrl },
  });

  res.status(200).json({
    message: "Element Updated",
    id:element.id
  });
});

adminRouter.post("/avatar", async (req, res) => {
  const parsedData = CreateAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Validation Error",
    });
    return;
  }
  try {
    await prisma.avatar.create({
      data: {
        imageUrl: parsedData.data.imageUrl,
        name: parsedData.data.name,
      },
    });
    res.status(200).json({
      message: "Added Avatar",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
});

adminRouter.post("/map", async (req, res) => {
  const parsed = CreateMapSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation Error",
    });
    return;
  }
  try {
    const map = await prisma.map.create({
      data: {
        width: parsed.data.width,
        height: parsed.data.height,
        name: parsed.data.name,
        thumbnail: parsed.data.thumbnail,
        mapElements: {
          create: parsed.data.defaultMapElements.map((e) => ({
            elementId: e.elementId,
            x: e.x,
            y: e.y,
          })),
        },
      },
    });
    res.status(200).json({
      message: "Map Created",
      id: map.id,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
