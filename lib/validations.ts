import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const itinerarySchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  days: z.number().min(1).max(30),
  tripType: z.enum(["solo", "couple", "family", "group", "corporate"]),
  budget: z.enum(["budget", "mid-range", "luxury"]),
  travelStyle: z.array(z.string()).min(1, "Select at least one style"),
});

export const bookingSchema = z.object({
  packageId: z.string().uuid(),
  travelDate: z.string(),
  numTravelers: z.number().min(1).max(20),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});

export const chatMessageSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  tripId: z.string().uuid().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ItineraryInput = z.infer<typeof itinerarySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
