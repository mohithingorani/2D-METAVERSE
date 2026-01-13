import Router from "express";
import { adminMiddleware } from "../../middlewares/admin";
import { CreateElementSchema, UpdateElementSchema } from "../../types";
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
  });
});
