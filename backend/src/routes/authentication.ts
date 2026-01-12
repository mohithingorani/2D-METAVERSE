import Router from "express";
const authRouter = Router();
import { prisma } from "../lib/prisma";

authRouter.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await prisma.user.create({
    data: {
      username,
      password,
    },
  });
  res.json({
    message: "User created successfully",
    user,
  });
});

authRouter.post("/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = prisma.user.findFirst({
    where: {
      username,
      password
    },
  });
  res.json({ user });
});

export default authRouter;