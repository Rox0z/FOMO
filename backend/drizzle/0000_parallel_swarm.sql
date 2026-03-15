CREATE TYPE "public"."user_type" AS ENUM('user', 'vendor');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"country_code" varchar(5),
	"user_type" "user_type" DEFAULT 'user' NOT NULL,
	"superuser" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");