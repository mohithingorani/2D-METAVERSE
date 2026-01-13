import z from "zod"


export const SignUpSchema = z.object({
    username : z.string(),
    password:z.string(),
    type : z.enum(["user","admin"])
})

export const SignInSchema = z.object({
    username : z.string(),
    password:z.string(),
})

export const SpaceSchema = z.object({
    name:z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId : z.string().optional()
})

export const DeleteElementSchema = z.object({
    id:z.string()
})

export const AddSpaceElementSchema = z.object({
    id : z.string(),
    elementId : z.string(),
    spaceId : z.string(),
    x : z.number(),
    y : z.number()
})

export const CreateElementSchema = z.object({
    width:z.number(),
    height:z.number(),
    static:z.boolean(),
    imageUrl:z.string()
})

export const UpdateElementSchema = z.object({
    imageUrl:z.string()
})

export const CreateAvatarSchema = z.object({
    imageUrl:z.string(),
    name:z.string()
})

export const CreateMapSchema = z.object({
    width:z.number(),
    height:z.number(),
    name:z.string(),
    thumbnail:z.string(),
    defaultMapElements:z.array(z.object({
        elementId:z.string(),
        x:z.number(),
        y:z.number()
    }))
    
})