import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import {
  insertUserSchema,
  loginSchema,
  signupSchema,
  insertJobSchema,
  insertForumPostSchema,
  insertStudentProfileSchema,
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "mody_placement_portal_secret_key_2024";

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware to verify JWT token
interface AuthRequest extends Request {
  user?: any;
}

const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Middleware to check role
const requireRole = (role: "student" | "admin") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const fs = await import("fs");
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // Serve uploaded files
  const express = await import("express");
  app.use("/uploads", express.default.static("uploads"));

  // AUTH ROUTES
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const data = signupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({ ...data, password: hashedPassword });

      // Create student profile if role is student
      if (user.role === "student") {
        await storage.createStudentProfile({
          userId: user.id,
          course: "",
          branch: "",
          cgpa: "0",
          graduationYear: new Date().getFullYear() + 1,
          skills: [],
        });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({ token, user });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user || user.role !== data.role) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({ token, user });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // STUDENT PROFILE ROUTES
  app.get(
    "/api/students/profile",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res: Response) => {
      try {
        const profile = await storage.getStudentProfileByUserId(req.user.id);
        res.json(profile);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.put(
    "/api/students/profile",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res: Response) => {
      try {
        const data = insertStudentProfileSchema.partial().parse(req.body);
        const profile = await storage.updateStudentProfile(req.user.id, data);
        
        if (profile) {
          await storage.createActivity({
            userId: req.user.id,
            type: "profile_update",
            description: "Updated profile information",
          });
        }
        
        res.json(profile);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.post(
    "/api/students/resume",
    authenticateToken,
    requireRole("student"),
    upload.single("resume"),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const resumeUrl = `/uploads/${req.file.filename}`;
        const profile = await storage.updateStudentProfile(req.user.id, { resumeUrl });

        await storage.createActivity({
          userId: req.user.id,
          type: "profile_update",
          description: "Updated resume",
        });

        res.json({ resumeUrl, profile });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.get(
    "/api/students/stats",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res: Response) => {
      try {
        const profile = await storage.getStudentProfileByUserId(req.user.id);
        const allJobs = await storage.getAllJobs();

        let eligibleJobs = 0;
        if (profile && profile.course && profile.branch && profile.cgpa) {
          eligibleJobs = allJobs.filter((job) => {
            if (!job.isActive) return false;
            const meetsGpa = parseFloat(profile.cgpa) >= parseFloat(job.minCgpa);
            const meetsCourse = job.eligibleCourses?.includes(profile.course);
            const meetsBranch = job.eligibleBranches?.includes(profile.branch);
            return meetsGpa && meetsCourse && meetsBranch;
          }).length;
        }

        res.json({ eligibleJobs });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // JOBS ROUTES
  app.get("/api/jobs", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get(
    "/api/jobs/eligible",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res: Response) => {
      try {
        const profile = await storage.getStudentProfileByUserId(req.user.id);
        const allJobs = await storage.getAllJobs();

        const jobsWithEligibility = await Promise.all(
          allJobs.map(async (job) => {
            let isEligible = false;
            if (profile && profile.course && profile.branch && profile.cgpa) {
              const meetsGpa = parseFloat(profile.cgpa) >= parseFloat(job.minCgpa);
              const meetsCourse = job.eligibleCourses?.includes(profile.course);
              const meetsBranch = job.eligibleBranches?.includes(profile.branch);
              isEligible = meetsGpa && meetsCourse && meetsBranch && job.isActive;
            }

            const hasApplied = await storage.hasApplied(req.user.id, job.id);

            return { ...job, isEligible, hasApplied };
          })
        );

        res.json(jobsWithEligibility);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.post(
    "/api/jobs",
    authenticateToken,
    requireRole("admin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const data = insertJobSchema.parse({
          ...req.body,
          postedBy: req.user.id,
        });

        const job = await storage.createJob(data);
        res.json(job);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.put(
    "/api/jobs/:id",
    authenticateToken,
    requireRole("admin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const data = insertJobSchema.partial().parse(req.body);
        const job = await storage.updateJob(req.params.id, data);

        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }

        res.json(job);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.delete(
    "/api/jobs/:id",
    authenticateToken,
    requireRole("admin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const deleted = await storage.deleteJob(req.params.id);
        if (!deleted) {
          return res.status(404).json({ message: "Job not found" });
        }
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // APPLICATIONS ROUTES
  app.post(
    "/api/applications",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res: Response) => {
      try {
        const { jobId } = req.body;

        // Check if already applied
        const hasApplied = await storage.hasApplied(req.user.id, jobId);
        if (hasApplied) {
          return res.status(400).json({ message: "Already applied to this job" });
        }

        // Check eligibility
        const profile = await storage.getStudentProfileByUserId(req.user.id);
        const job = await storage.getJob(jobId);

        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }

        if (profile && profile.course && profile.branch && profile.cgpa) {
          const meetsGpa = parseFloat(profile.cgpa) >= parseFloat(job.minCgpa);
          const meetsCourse = job.eligibleCourses?.includes(profile.course);
          const meetsBranch = job.eligibleBranches?.includes(profile.branch);

          if (!meetsGpa || !meetsCourse || !meetsBranch) {
            return res.status(403).json({ message: "Not eligible for this job" });
          }
        } else {
          return res.status(400).json({ message: "Please complete your profile first" });
        }

        const application = await storage.createApplication({
          jobId,
          studentId: req.user.id,
        });

        await storage.createActivity({
          userId: req.user.id,
          type: "application",
          description: `Applied to ${job.position} at ${job.companyName}`,
        });

        res.json(application);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // FORUM POSTS ROUTES
  app.get("/api/forum-posts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const posts = await storage.getAllForumPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(
    "/api/forum-posts",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res: Response) => {
      try {
        const data = insertForumPostSchema.parse({
          ...req.body,
          authorId: req.user.id,
          authorName: req.user.fullName,
        });

        const post = await storage.createForumPost(data);

        await storage.createActivity({
          userId: req.user.id,
          type: "post",
          description: `Posted interview experience for ${data.position} at ${data.companyName}`,
        });

        res.json(post);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.delete(
    "/api/forum-posts/:id",
    authenticateToken,
    requireRole("admin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const deleted = await storage.deleteForumPost(req.params.id);
        if (!deleted) {
          return res.status(404).json({ message: "Post not found" });
        }
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // NOTIFICATIONS ROUTES
  app.get(
    "/api/notifications",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res: Response) => {
      try {
        const notifications = await storage.getActiveNotifications();
        res.json(notifications);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // ACTIVITIES ROUTES
  app.get(
    "/api/activities",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res: Response) => {
      try {
        const activities = await storage.getActivitiesByUser(req.user.id);
        res.json(activities);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // ADMIN ANALYTICS ROUTES
  app.get(
    "/api/admin/analytics",
    authenticateToken,
    requireRole("admin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const allProfiles = await storage.getAllStudentProfiles();
        const allJobs = await storage.getAllJobs();
        const allApplications = await storage.getAllApplications();
        const allPosts = await storage.getAllForumPosts();

        // Calculate average CGPA
        const validProfiles = allProfiles.filter((p) => p.cgpa && parseFloat(p.cgpa) > 0);
        const averageCGPA =
          validProfiles.length > 0
            ? validProfiles.reduce((sum, p) => sum + parseFloat(p.cgpa), 0) /
              validProfiles.length
            : 0;

        // Course distribution
        const courseCount: { [key: string]: number } = {};
        allProfiles.forEach((p) => {
          if (p.course) {
            courseCount[p.course] = (courseCount[p.course] || 0) + 1;
          }
        });
        const topCourses = Object.entries(courseCount)
          .map(([course, count]) => ({ course, count }))
          .sort((a, b) => b.count - a.count);

        // Branch distribution
        const branchCount: { [key: string]: number } = {};
        allProfiles.forEach((p) => {
          if (p.branch) {
            branchCount[p.branch] = (branchCount[p.branch] || 0) + 1;
          }
        });
        const topBranches = Object.entries(branchCount)
          .map(([branch, count]) => ({ branch, count }))
          .sort((a, b) => b.count - a.count);

        // Recent applications (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentApplications = allApplications.filter(
          (app) => new Date(app.appliedAt) > sevenDaysAgo
        ).length;

        res.json({
          totalStudents: allProfiles.length,
          totalJobs: allJobs.filter((j) => j.isActive).length,
          totalApplications: allApplications.length,
          totalPosts: allPosts.length,
          averageCGPA,
          topCourses,
          topBranches,
          recentApplications,
        });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
