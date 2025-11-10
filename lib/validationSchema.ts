import { z } from "zod";
export const signUpschema = z.object({
  fullName: z.string().min(3, "Name should be more than 3 characters"),
  email: z.email("Please enter a valid email"),
  // phone: z
  //   .string()
  //   .regex(
  //     /^(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4,7}$/,
  //     "Please enter a valid phone"
  //   ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),

  password: z.string().min(6, "Password must be at least 6 characters"),
  // .min(6, "Password must be at least 6 characters"),
});
