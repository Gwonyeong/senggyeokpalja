-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "photo_url" TEXT,
    "provider" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "firebase_uid" TEXT,
    "last_sign_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."personality_types" (
    "code" VARCHAR(4) NOT NULL,
    "alias" TEXT NOT NULL,
    "image_url" TEXT,
    "description" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personality_types_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "public"."analysis_results" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "personality_type" VARCHAR(4) NOT NULL,
    "mbti_type" VARCHAR(4),
    "palja_type" VARCHAR(20),
    "birth_date" DATE,
    "birth_time" TIME,
    "lunar_calendar" BOOLEAN NOT NULL DEFAULT false,
    "analysis_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."synergy_analysis" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "partner_type" VARCHAR(4) NOT NULL,
    "user_type" VARCHAR(4) NOT NULL,
    "compatibility_score" INTEGER,
    "analysis_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "synergy_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."saved_results" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "result_type" VARCHAR(20) NOT NULL,
    "result_id" UUID,
    "title" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consultation_results" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "birth_date" DATE NOT NULL,
    "birth_time" TIME,
    "lunar_calendar" BOOLEAN NOT NULL DEFAULT false,
    "year_stem" VARCHAR(10) NOT NULL,
    "year_branch" VARCHAR(10) NOT NULL,
    "month_stem" VARCHAR(10) NOT NULL,
    "month_branch" VARCHAR(10) NOT NULL,
    "day_stem" VARCHAR(10) NOT NULL,
    "day_branch" VARCHAR(10) NOT NULL,
    "time_stem" VARCHAR(10),
    "time_branch" VARCHAR(10),
    "wood_count" INTEGER NOT NULL DEFAULT 0,
    "fire_count" INTEGER NOT NULL DEFAULT 0,
    "earth_count" INTEGER NOT NULL DEFAULT 0,
    "metal_count" INTEGER NOT NULL DEFAULT 0,
    "water_count" INTEGER NOT NULL DEFAULT 0,
    "dominant_element" VARCHAR(10),
    "ten_gods" JSONB,
    "heavenly_stem_gods" JSONB,
    "personality_type" VARCHAR(4),
    "fortune_data" JSONB,
    "compatibility_data" JSONB,
    "additional_data" JSONB,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "payment_method" VARCHAR(50),
    "payment_amount" INTEGER,
    "payment_key" VARCHAR(200),
    "order_id" VARCHAR(200),
    "consultation_type" VARCHAR(50),
    "consultation_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_results" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "payment_key" VARCHAR(200) NOT NULL,
    "order_id" VARCHAR(200) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'KRW',
    "method" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL,
    "failure_code" VARCHAR(100),
    "failure_message" TEXT,
    "customer_name" VARCHAR(100),
    "customer_email" VARCHAR(200),
    "customer_phone" VARCHAR(50),
    "card_number" VARCHAR(50),
    "card_type" VARCHAR(50),
    "card_company" VARCHAR(50),
    "installment_month" INTEGER,
    "product_name" VARCHAR(200),
    "metadata" JSONB,
    "requested_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_settings" (
    "id" UUID NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" JSONB,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "public"."profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_firebase_uid_key" ON "public"."profiles"("firebase_uid");

-- CreateIndex
CREATE INDEX "analysis_results_user_id_idx" ON "public"."analysis_results"("user_id");

-- CreateIndex
CREATE INDEX "analysis_results_personality_type_idx" ON "public"."analysis_results"("personality_type");

-- CreateIndex
CREATE INDEX "synergy_analysis_user_id_idx" ON "public"."synergy_analysis"("user_id");

-- CreateIndex
CREATE INDEX "saved_results_user_id_idx" ON "public"."saved_results"("user_id");

-- CreateIndex
CREATE INDEX "consultation_results_user_id_idx" ON "public"."consultation_results"("user_id");

-- CreateIndex
CREATE INDEX "consultation_results_is_paid_idx" ON "public"."consultation_results"("is_paid");

-- CreateIndex
CREATE INDEX "consultation_results_created_at_idx" ON "public"."consultation_results"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_results_payment_key_key" ON "public"."payment_results"("payment_key");

-- CreateIndex
CREATE UNIQUE INDEX "payment_results_order_id_key" ON "public"."payment_results"("order_id");

-- CreateIndex
CREATE INDEX "payment_results_user_id_idx" ON "public"."payment_results"("user_id");

-- CreateIndex
CREATE INDEX "payment_results_status_idx" ON "public"."payment_results"("status");

-- CreateIndex
CREATE INDEX "payment_results_created_at_idx" ON "public"."payment_results"("created_at");

-- CreateIndex
CREATE INDEX "payment_results_payment_key_idx" ON "public"."payment_results"("payment_key");

-- CreateIndex
CREATE INDEX "payment_results_order_id_idx" ON "public"."payment_results"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_settings_setting_key_key" ON "public"."admin_settings"("setting_key");

-- AddForeignKey
ALTER TABLE "public"."analysis_results" ADD CONSTRAINT "analysis_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."synergy_analysis" ADD CONSTRAINT "synergy_analysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."synergy_analysis" ADD CONSTRAINT "synergy_analysis_partner_type_fkey" FOREIGN KEY ("partner_type") REFERENCES "public"."personality_types"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."synergy_analysis" ADD CONSTRAINT "synergy_analysis_user_type_fkey" FOREIGN KEY ("user_type") REFERENCES "public"."personality_types"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_results" ADD CONSTRAINT "saved_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultation_results" ADD CONSTRAINT "consultation_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_results" ADD CONSTRAINT "payment_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;