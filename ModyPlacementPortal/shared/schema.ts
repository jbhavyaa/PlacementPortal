import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'student' or 'admin'
  fullName: text("full_name").notNull(),
});

// Student profiles with academic details
export const studentProfiles = pgTable("student_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  course: text("course").notNull(), // B.Tech, M.Tech, MBA, etc.
  branch: text("branch").notNull(), // CSE, ECE, ME, etc.
  cgpa: decimal("cgpa", { precision: 3, scale: 2 }).notNull(),
  graduationYear: integer("graduation_year").notNull(),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  skills: text("skills").array(),
  linkedin: text("linkedin"),
  github: text("github"),
});

// Jobs with eligibility criteria
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  position: text("position").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  minCgpa: decimal("min_cgpa", { precision: 3, scale: 2 }).notNull(),
  eligibleCourses: text("eligible_courses").array().notNull(), // ['B.Tech', 'M.Tech']
  eligibleBranches: text("eligible_branches").array().notNull(), // ['CSE', 'ECE']
  deadline: timestamp("deadline").notNull(),
  postedBy: varchar("posted_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  isActive: boolean("is_active").notNull().default(true),
});

// Job applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  studentId: varchar("student_id").notNull(),
  appliedAt: timestamp("applied_at").notNull().default(sql`now()`),
  status: text("status").notNull().default('pending'), // pending, accepted, rejected
});

// Forum posts for interview experiences
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  authorName: text("author_name").notNull(),
  companyName: text("company_name").notNull(),
  position: text("position").notNull(),
  experience: text("experience").notNull(),
  interviewDate: timestamp("interview_date"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Admin notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  isActive: boolean("is_active").notNull().default(true),
});

// Recent activities
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'application', 'post', 'profile_update'
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas with validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true }).extend({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['student', 'admin']),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({ id: true }).extend({
  course: z.string().min(1),
  branch: z.string().min(1),
  cgpa: z.string().refine(val => {
    const num = parseFloat(val);
    return num >= 0 && num <= 10;
  }),
  graduationYear: z.number().min(2020).max(2030),
  skills: z.array(z.string()).optional(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true }).extend({
  companyName: z.string().min(1),
  position: z.string().min(1),
  description: z.string().min(10),
  minCgpa: z.string().refine(val => {
    const num = parseFloat(val);
    return num >= 0 && num <= 10;
  }),
  eligibleCourses: z.array(z.string()).min(1),
  eligibleBranches: z.array(z.string()).min(1),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true });

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true }).extend({
  experience: z.string().min(20),
  tags: z.array(z.string()).optional(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'admin']),
});

// Signup schema (extends login with fullName)
export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
