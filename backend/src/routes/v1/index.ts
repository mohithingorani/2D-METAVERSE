import Router from "express";
const router = Router();
import { prisma } from "../../lib/prisma";
import { SignInSchema, SignUpSchema } from "../../types";
import { compare, hash } from "../../scrypt";
import jwt from "jsonwebtoken";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { wsRouter } from "./ws";



const JWT_PASSWORD = process.env.JWT_PASSWORD as string;

router.post("/signup", async (req, res) => {
  const parsedData = SignUpSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Validation Error",
    });
    return;
  }

  // hashing password
  const hashedPassword = await hash(parsedData.data.password);

  try {
    const user = await prisma.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role:parsedData.data.type=="admin"?"Admin":"User"
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_PASSWORD,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "User created successfully",
      token
    });
  } catch (err) {
    res.status(400).json({
      message: "User Already Exists",
    });
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = SignInSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({
      message: "Validation Error",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!user) {
      res.status(403).json({
        message: "User not found",
      });
      return;
    }

    const isValid = await compare(parsedData.data.password, user.password);
    if (!isValid) {
      res.status(403).json({
        message: "Invalid password",
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, password: user.password },
      JWT_PASSWORD
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.use("/space",spaceRouter);
router.use("/admin",adminRouter);
router.use("/ws",wsRouter);
export default router;
