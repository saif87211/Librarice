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
  rollno: z.string(),
  gender: z.enum(["Male", "Female"]),
  medium: z.enum(["English", "Gujarati"]),
  section: z.string(),
});

const categorySchema = z.object({
  categoryname: z.string(),
  fineamount: z.number().gte(0).lte(50),
});

const bookSchema = z.object({
  uniqueId: z.string(),
  bookname: z.string(),
  bookcategory: z.string()
});

const validateRegisterUser = (userdata) => {
  const validation = userRegisterSchema.safeParse(userdata);
  return validation.success;
};
const validateLoginUser = (logindata) => {
  const validation = userLoginSchema.safeParse(logindata);
  return validation.success;
};

const validateStudent = (studentdata) => {
  const validation = studentSchema.safeParse(studentdata);
  return validation.success;
};

const validateBookCategory = (bookCateogryData) => {
  const validation = categorySchema.safeParse(bookCateogryData);
  return validation.success;
};

const validateBook = (bookData) => {
  const validation = bookSchema.safeParse(bookData);
  return validation.success;
}
export {
  validateRegisterUser,
  validateLoginUser,
  validateStudent,
  validateBookCategory,
  validateBook
};
