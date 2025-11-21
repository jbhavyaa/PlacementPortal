// import { randomUUID } from "crypto";
// import type {
//   User,
//   InsertUser,
//   StudentProfile,
//   InsertStudentProfile,
//   Job,
//   InsertJob,
//   Application,
//   InsertApplication,
//   ForumPost,
//   InsertForumPost,
//   Notification,
//   InsertNotification,
//   Activity,
//   InsertActivity,
// } from "@shared/schema";

// export interface IStorage {
//   // Users
//   getUser(id: string): Promise<User | undefined>;
//   getUserByEmail(email: string): Promise<User | undefined>;
//   createUser(user: InsertUser): Promise<User>;
  
//   // Student Profiles
//   getStudentProfileByUserId(userId: string): Promise<StudentProfile | undefined>;
//   createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
//   updateStudentProfile(userId: string, profile: Partial<InsertStudentProfile>): Promise<StudentProfile | undefined>;
//   getAllStudentProfiles(): Promise<StudentProfile[]>;
  
//   // Jobs
//   getAllJobs(): Promise<Job[]>;
//   getJob(id: string): Promise<Job | undefined>;
//   createJob(job: InsertJob): Promise<Job>;
//   updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
//   deleteJob(id: string): Promise<boolean>;
  
//   // Applications
//   createApplication(application: InsertApplication): Promise<Application>;
//   getApplicationsByStudent(studentId: string): Promise<Application[]>;
//   getApplicationsByJob(jobId: string): Promise<Application[]>;
//   hasApplied(studentId: string, jobId: string): Promise<boolean>;
//   getAllApplications(): Promise<Application[]>;
  
//   // Forum Posts
//   getAllForumPosts(): Promise<ForumPost[]>;
//   createForumPost(post: InsertForumPost): Promise<ForumPost>;
//   deleteForumPost(id: string): Promise<boolean>;
  
//   // Notifications
//   getActiveNotifications(): Promise<Notification[]>;
//   createNotification(notification: InsertNotification): Promise<Notification>;
  
//   // Activities
//   getActivitiesByUser(userId: string): Promise<Activity[]>;
//   createActivity(activity: InsertActivity): Promise<Activity>;
// }

// export class MemStorage implements IStorage {
//   private users: Map<string, User>;
//   private studentProfiles: Map<string, StudentProfile>;
//   private jobs: Map<string, Job>;
//   private applications: Map<string, Application>;
//   private forumPosts: Map<string, ForumPost>;
//   private notifications: Map<string, Notification>;
//   private activities: Map<string, Activity>;

//   constructor() {
//     this.users = new Map();
//     this.studentProfiles = new Map();
//     this.jobs = new Map();
//     this.applications = new Map();
//     this.forumPosts = new Map();
//     this.notifications = new Map();
//     this.activities = new Map();
//   }

//   // Users
//   async getUser(id: string): Promise<User | undefined> {
//     return this.users.get(id);
//   }

//   async getUserByEmail(email: string): Promise<User | undefined> {
//     return Array.from(this.users.values()).find((user) => user.email === email);
//   }

//   async createUser(insertUser: InsertUser): Promise<User> {
//     const id = randomUUID();
//     const user: User = { ...insertUser, id };
//     this.users.set(id, user);
//     return user;
//   }

//   // Student Profiles
//   async getStudentProfileByUserId(userId: string): Promise<StudentProfile | undefined> {
//     return Array.from(this.studentProfiles.values()).find(
//       (profile) => profile.userId === userId
//     );
//   }

//   async createStudentProfile(insertProfile: InsertStudentProfile): Promise<StudentProfile> {
//     const id = randomUUID();
//     const profile: StudentProfile = { ...insertProfile, id };
//     this.studentProfiles.set(id, profile);
//     return profile;
//   }

//   async updateStudentProfile(
//     userId: string,
//     updates: Partial<InsertStudentProfile>
//   ): Promise<StudentProfile | undefined> {
//     const profile = await this.getStudentProfileByUserId(userId);
//     if (!profile) return undefined;

//     const updated = { ...profile, ...updates };
//     this.studentProfiles.set(profile.id, updated);
//     return updated;
//   }

//   async getAllStudentProfiles(): Promise<StudentProfile[]> {
//     return Array.from(this.studentProfiles.values());
//   }

//   // Jobs
//   async getAllJobs(): Promise<Job[]> {
//     return Array.from(this.jobs.values()).sort(
//       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );
//   }

//   async getJob(id: string): Promise<Job | undefined> {
//     return this.jobs.get(id);
//   }

//   async createJob(insertJob: InsertJob): Promise<Job> {
//     const id = randomUUID();
//     const job: Job = {
//       ...insertJob,
//       id,
//       createdAt: new Date(),
//     };
//     this.jobs.set(id, job);
//     return job;
//   }

//   async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
//     const job = this.jobs.get(id);
//     if (!job) return undefined;

//     const updated = { ...job, ...updates };
//     this.jobs.set(id, updated);
//     return updated;
//   }

//   async deleteJob(id: string): Promise<boolean> {
//     return this.jobs.delete(id);
//   }

//   // Applications
//   async createApplication(insertApplication: InsertApplication): Promise<Application> {
//     const id = randomUUID();
//     const application: Application = {
//       ...insertApplication,
//       id,
//       appliedAt: new Date(),
//       status: "pending",
//     };
//     this.applications.set(id, application);
//     return application;
//   }

//   async getApplicationsByStudent(studentId: string): Promise<Application[]> {
//     return Array.from(this.applications.values()).filter(
//       (app) => app.studentId === studentId
//     );
//   }

//   async getApplicationsByJob(jobId: string): Promise<Application[]> {
//     return Array.from(this.applications.values()).filter(
//       (app) => app.jobId === jobId
//     );
//   }

//   async hasApplied(studentId: string, jobId: string): Promise<boolean> {
//     return Array.from(this.applications.values()).some(
//       (app) => app.studentId === studentId && app.jobId === jobId
//     );
//   }

//   async getAllApplications(): Promise<Application[]> {
//     return Array.from(this.applications.values());
//   }

//   // Forum Posts
//   async getAllForumPosts(): Promise<ForumPost[]> {
//     return Array.from(this.forumPosts.values()).sort(
//       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );
//   }

//   async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
//     const id = randomUUID();
//     const post: ForumPost = {
//       ...insertPost,
//       id,
//       createdAt: new Date(),
//     };
//     this.forumPosts.set(id, post);
//     return post;
//   }

//   async deleteForumPost(id: string): Promise<boolean> {
//     return this.forumPosts.delete(id);
//   }

//   // Notifications
//   async getActiveNotifications(): Promise<Notification[]> {
//     return Array.from(this.notifications.values())
//       .filter((n) => n.isActive)
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   }

//   async createNotification(insertNotification: InsertNotification): Promise<Notification> {
//     const id = randomUUID();
//     const notification: Notification = {
//       ...insertNotification,
//       id,
//       createdAt: new Date(),
//       isActive: true,
//     };
//     this.notifications.set(id, notification);
//     return notification;
//   }

//   // Activities
//   async getActivitiesByUser(userId: string): Promise<Activity[]> {
//     return Array.from(this.activities.values())
//       .filter((activity) => activity.userId === userId)
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//       .slice(0, 10);
//   }

//   async createActivity(insertActivity: InsertActivity): Promise<Activity> {
//     const id = randomUUID();
//     const activity: Activity = {
//       ...insertActivity,
//       id,
//       createdAt: new Date(),
//     };
//     this.activities.set(id, activity);
//     return activity;
//   }
// }

// export const storage = new MemStorage();


import { eq, and } from "drizzle-orm";
import {
  users,
  studentProfiles,
  jobs,
  applications,
  forumPosts,
  notifications,
  activities,
} from "@shared/schema";
import { db } from "./db";

import type {
  User,
  InsertUser,
  StudentProfile,
  InsertStudentProfile,
  Job,
  InsertJob,
  Application,
  InsertApplication,
  ForumPost,
  InsertForumPost,
  Notification,
  InsertNotification,
  Activity,
  InsertActivity,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student Profiles
  getStudentProfileByUserId(userId: string): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(
    userId: string,
    profile: Partial<InsertStudentProfile>
  ): Promise<StudentProfile | undefined>;
  getAllStudentProfiles(): Promise<StudentProfile[]>;

  // Jobs
  getAllJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;

  // Applications
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByStudent(studentId: string): Promise<Application[]>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  hasApplied(studentId: string, jobId: string): Promise<boolean>;
  getAllApplications(): Promise<Application[]>;

  // Forum Posts
  getAllForumPosts(): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  deleteForumPost(id: string): Promise<boolean>;

  // Notifications
  getActiveNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;

  // Activities
  getActivitiesByUser(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

// ---------------------------------
// DRIZZLE IMPLEMENTATION STARTS
// ---------------------------------
export class DrizzleStorage implements IStorage {
  //
  // USERS
  //
  async getUser(id: string): Promise<User | undefined> {
    const data = await db.select().from(users).where(eq(users.id, id));
    return data[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const data = await db.select().from(users).where(eq(users.email, email));
    return data[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const data = await db.insert(users).values(insertUser).returning();
    return data[0];
  }

  //
  // STUDENT PROFILES
  //
  async getStudentProfileByUserId(userId: string): Promise<StudentProfile | undefined> {
    const data = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId));
    return data[0];
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const data = await db.insert(studentProfiles).values(profile).returning();
    return data[0];
  }

  async updateStudentProfile(
    userId: string,
    updates: Partial<InsertStudentProfile>
  ): Promise<StudentProfile | undefined> {
    const data = await db
      .update(studentProfiles)
      .set(updates)
      .where(eq(studentProfiles.userId, userId))
      .returning();
    return data[0];
  }

  async getAllStudentProfiles(): Promise<StudentProfile[]> {
    return await db.select().from(studentProfiles);
  }

  //
  // JOBS
  //
  async getAllJobs(): Promise<Job[]> {
    const list = await db.select().from(jobs).orderBy(jobs.createdAt);
    return list.reverse();
  }

  async getJob(id: string): Promise<Job | undefined> {
    const data = await db.select().from(jobs).where(eq(jobs.id, id));
    return data[0];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const data = await db.insert(jobs).values(job).returning();
    return data[0];
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const data = await db
      .update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return data[0];
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return result.rowCount ? true : false;
  }

  //
  // APPLICATIONS
  //
  async createApplication(application: InsertApplication): Promise<Application> {
    const data = await db.insert(applications).values(application).returning();
    return data[0];
  }

  async getApplicationsByStudent(studentId: string): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.studentId, studentId));
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async hasApplied(studentId: string, jobId: string): Promise<boolean> {
    const data = await db
      .select()
      .from(applications)
      .where(
        and(eq(applications.studentId, studentId), eq(applications.jobId, jobId))
      );
    return data.length > 0;
  }

  async getAllApplications(): Promise<Application[]> {
    return db.select().from(applications);
  }

  //
  // FORUM POSTS
  //
  async getAllForumPosts(): Promise<ForumPost[]> {
    const list = await db.select().from(forumPosts).orderBy(forumPosts.createdAt);
    return list.reverse();
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const data = await db.insert(forumPosts).values(post).returning();
    return data[0];
  }

  async deleteForumPost(id: string): Promise<boolean> {
    const result = await db.delete(forumPosts).where(eq(forumPosts.id, id));
    return result.rowCount ? true : false;
  }

  //
  // NOTIFICATIONS
  //
  async getActiveNotifications(): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.isActive, true))
      .orderBy(notifications.createdAt);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const data = await db.insert(notifications).values(notification).returning();
    return data[0];
  }

  //
  // ACTIVITIES
  //
  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    const list = await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.createdAt);

    return list.reverse().slice(0, 10);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const data = await db.insert(activities).values(insertActivity).returning();
    return data[0];
  }
}

// Export final instance
export const storage = new DrizzleStorage();
