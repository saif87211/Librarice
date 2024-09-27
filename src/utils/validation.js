import { z } from "zod";

const userRegisterSchema = z.object({
  fullname: z.string().min(4),
  username: z.string().trim().toLowerCase().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  isAdmin: z.boolean(),
});

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const validateRegisterUser = (userdata) => {
  const validation = userRegisterSchema.safeParse(userdata);
  console.log(validation);
  return validation.success;
};
const validateLoginUser = (logindata) => {
  const validation = userLoginSchema.safeParse(logindata);
  return validation.success;
};

export { validateRegisterUser, validateLoginUser };
