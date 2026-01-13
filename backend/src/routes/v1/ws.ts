import Router from "express"
import { prisma } from "../../lib/prisma";

export const wsRouter = Router();

wsRouter.get("/space/:spaceId",async(req,res)=>{
    try{

    const space = await prisma.space.findFirst({
        where:{
            id:req.params.spaceId
        }
    })
    if(!space){
        res.status(400).json({
            message:"Space doesnt exist"
        })
        return
    }
    res.status(200).json({
        space
    })
    }catch(err){
        res.status(500).json({
            message:"Internal Server Error",
            err
        })
    }

})