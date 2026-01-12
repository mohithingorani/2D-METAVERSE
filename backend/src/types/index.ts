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