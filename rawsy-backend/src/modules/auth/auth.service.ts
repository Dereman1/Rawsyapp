import User from "./auth.model";
import bcrypt from "bcryptjs";
import  * as jwt from "jsonwebtoken";

// ---------------- REGISTER USER ----------------
export const registerUser = async (data: any) => {
  const { name, email, phone, password, role } = data;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
    status: role === "supplier" ? "pending" : "active"
  });

  // Return user without password
  const cleanUser = user.toObject();
  delete cleanUser.password;

  return cleanUser;
};

// ---------------- LOGIN USER ----------------
export const loginUser = async (emailOrPhone: string, password: string) => {
  // MUST include password manually
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
  }).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  // Check deactivated
  if (user.status === "deactivated") {
    throw new Error("Your account has been deactivated. Contact admin.");
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password!);
  if (!isMatch) {
    throw new Error("Incorrect password");
  }

  // Generate token
  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET as jwt.Secret,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }as jwt.SignOptions
  );

  // Remove password before returning user
  const cleanUser = user.toObject();
  delete cleanUser.password;

  return {
    user: cleanUser,
    token
  };
};
