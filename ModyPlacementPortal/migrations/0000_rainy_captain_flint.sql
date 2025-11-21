CREATE TABLE "activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" varchar NOT NULL,
	"author_name" text NOT NULL,
	"company_name" text NOT NULL,
	"position" text NOT NULL,
	"experience" text NOT NULL,
	"interview_date" timestamp,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"position" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"salary" text,
	"min_cgpa" numeric(3, 2) NOT NULL,
	"eligible_courses" text[] NOT NULL,
	"eligible_branches" text[] NOT NULL,
	"deadline" timestamp NOT NULL,
	"posted_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course" text NOT NULL,
	"branch" text NOT NULL,
	"cgpa" numeric(3, 2) NOT NULL,
	"graduation_year" integer NOT NULL,
	"phone" text,
	"resume_url" text,
	"skills" text[],
	"linkedin" text,
	"github" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"full_name" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
