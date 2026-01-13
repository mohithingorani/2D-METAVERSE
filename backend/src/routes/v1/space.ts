import Router from "express";
import { userMiddleware } from "../../middlewares/user";
import { DeleteElementSchema, SpaceSchema } from "../../types";
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
    console.log("Created empty space");
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
    console.log("Map not found");
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
  console.log("Space created");
  res.json({ spaceId: space.id });
});

spaceRouter.delete("/element",userMiddleware,async(req,res)=>{
  const parsedData = DeleteElementSchema.safeParse(req.body);
  if(!parsedData.success){
    console.log("Validation Error");
    res.status(422).json({
      message:"Validation Error"
    });
    return;
  }
  const spaceElement = await prisma.spaceElement.findFirst({
    where:{
      id:parsedData.data.id
    },
    include:{
      space:true
    }
  })
  if(!spaceElement?.space.creatorId || spaceElement.space.creatorId != req.userId){
    res.status(401).json({
      message:"Unauthorized"
    })
    return;
  }
  await prisma.spaceElement.delete({
    where:{
      id:spaceElement.id
    }
  })
  res.status(200).json({
    message:"Space Element Deleted"
  })

})

spaceRouter.delete("/:spaceId",userMiddleware,async (req,res)=>{
  const spaceId = req.params.spaceId as string;
  const space = await prisma.space.findUnique({
    where:{
      id:spaceId
    },
    select:{
      creatorId:true
    }
  })
  if(!space){
    res.status(400).json({
      message:"Space Not Found"
    })
    return;
  }
  if(space.creatorId!=req.userId){
    res.status(403).json({
      message:"Unauthorized"
    })
    return;
  }
  await prisma.space.delete({
    where:{
      id:spaceId
    }
  })
  res.status(200).json({
    message:"Space Deleted"
  })
})

spaceRouter.get("/all",userMiddleware,async(req,res)=>{
  const spaces = await prisma.space.findMany({
    where:{
      creatorId:req.userId
    }
  });
  
  res.status(200).json({
    spaces:spaces.map((s)=>({
      id:s.id,
      name:s.name,
      thumbnail:s.thumbnail,
      dimensions:`${s.width}x${s.height}`
    }))
  })
})




