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

const studentSchema = z.object({
  name: z.string(),
  rollno: z.number(),
  medium: z.ZodEnum(["English", "Gujarati"]),
  section: z.string(),
  gender: z.ZodEnum(["Male", "Female"]),
});

const categorySchema = z.object({
  categoryname: z.string(),
});
const validateRegisterUser = (userdata) => {
  const validation = userRegisterSchema.safeParse(userdata);
  console.log(validation);
  return validation.success;
};
const validateLoginUser = (logindata) => {
  const validation = userLoginSchema.safeParse(logindata);
  console.log(validation);
  return validation.success;
};

const validateStudent = (studentdata) => {
  const validation = studentSchema.safeParse(studentdata);
  console.log(validation);
  return validation.success;
};

const validateBookCategory = (BookCateogryData) => {
  const validation = categorySchema.safeParse(BookCateogryData);
  console.log(validation);
  return validation.success;
};

export {
  validateRegisterUser,
  validateLoginUser,
  validateStudent,
  validateBookCategory,
};
