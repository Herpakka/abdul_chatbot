/*
  Warnings:

  - The primary key for the `Chats` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "public"."education_level" AS ENUM ('ปวช.', 'ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก');

-- CreateEnum
CREATE TYPE "public"."message_roles" AS ENUM ('assistant', 'system', 'user');

-- CreateEnum
CREATE TYPE "public"."paid_status" AS ENUM ('trial', 'active', 'expired', 'legacy');

-- CreateEnum
CREATE TYPE "public"."roles" AS ENUM ('admin', 'user', 'guest');

-- DropForeignKey
ALTER TABLE "passprism"."Chats" DROP CONSTRAINT "Chats_userId_fkey";

-- AlterTable
ALTER TABLE "passprism"."Chats" DROP CONSTRAINT "Chats_pkey",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "id" SET DATA TYPE VARCHAR,
ALTER COLUMN "userId" SET DATA TYPE VARCHAR,
ALTER COLUMN "chatTitle" SET DATA TYPE VARCHAR,
ADD CONSTRAINT "Chats_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."n8n_chat_histories" (
    "id" SERIAL NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "message" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "n8n_chat_histories_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "provider_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "refresh_token_expires_at" TIMESTAMP(6),
    "password" TEXT,
    "access_token_expires_at" TIMESTAMP(6),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."annotation_tag_entity" (
    "id" VARCHAR(16) NOT NULL,
    "name" VARCHAR(24) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_69dfa041592c30bbc0d4b84aa00" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auth_identity" (
    "userId" UUID,
    "providerId" VARCHAR(64) NOT NULL,
    "providerType" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "auth_identity_pkey" PRIMARY KEY ("providerId","providerType")
);

-- CreateTable
CREATE TABLE "public"."auth_provider_sync_history" (
    "id" SERIAL NOT NULL,
    "providerType" VARCHAR(32) NOT NULL,
    "runMode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanned" INTEGER NOT NULL,
    "created" INTEGER NOT NULL,
    "updated" INTEGER NOT NULL,
    "disabled" INTEGER NOT NULL,
    "error" TEXT,

    CONSTRAINT "auth_provider_sync_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."authenticators" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credential_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "credential_public_key" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credential_device_type" TEXT NOT NULL,
    "credential_backed_up" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "authenticators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" UUID NOT NULL,
    "ragie_connection_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "last_synced_at" TIMESTAMPTZ(6),
    "addedBy" TEXT,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "profile_id" UUID NOT NULL,
    "slack_thread_id" TEXT,
    "slack_event" JSON,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."credentials_entity" (
    "name" VARCHAR(128) NOT NULL,
    "data" TEXT NOT NULL,
    "type" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "id" VARCHAR(36) NOT NULL,
    "isManaged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "credentials_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_destinations" (
    "id" UUID NOT NULL,
    "destination" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "event_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."execution_annotation_tags" (
    "annotationId" INTEGER NOT NULL,
    "tagId" VARCHAR(24) NOT NULL,

    CONSTRAINT "PK_979ec03d31294cca484be65d11f" PRIMARY KEY ("annotationId","tagId")
);

-- CreateTable
CREATE TABLE "public"."execution_annotations" (
    "id" SERIAL NOT NULL,
    "executionId" INTEGER NOT NULL,
    "vote" VARCHAR(6),
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_7afcf93ffa20c4252869a7c6a23" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."execution_data" (
    "executionId" INTEGER NOT NULL,
    "workflowData" JSON NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "execution_data_pkey" PRIMARY KEY ("executionId")
);

-- CreateTable
CREATE TABLE "public"."execution_entity" (
    "id" SERIAL NOT NULL,
    "finished" BOOLEAN NOT NULL,
    "mode" VARCHAR NOT NULL,
    "retryOf" VARCHAR,
    "retrySuccessId" VARCHAR,
    "startedAt" TIMESTAMPTZ(3),
    "stoppedAt" TIMESTAMPTZ(3),
    "waitTill" TIMESTAMPTZ(3),
    "status" VARCHAR NOT NULL,
    "workflowId" VARCHAR(36) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "pk_e3e63bbf986767844bbe1166d4e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."execution_metadata" (
    "id" SERIAL NOT NULL,
    "executionId" INTEGER NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PK_17a0b6284f8d626aae88e1c16e4" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."folder" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "parentFolderId" VARCHAR(36),
    "projectId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_6278a41a706740c94c02e288df8" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."folder_tag" (
    "folderId" VARCHAR(36) NOT NULL,
    "tagId" VARCHAR(36) NOT NULL,

    CONSTRAINT "PK_27e4e00852f6b06a925a4d83a3e" PRIMARY KEY ("folderId","tagId")
);

-- CreateTable
CREATE TABLE "public"."insights_by_period" (
    "id" SERIAL NOT NULL,
    "metaId" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "periodUnit" INTEGER NOT NULL,
    "periodStart" TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_b606942249b90cc39b0265f0575" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."insights_metadata" (
    "metaId" SERIAL NOT NULL,
    "workflowId" VARCHAR(16),
    "projectId" VARCHAR(36),
    "workflowName" VARCHAR(128) NOT NULL,
    "projectName" VARCHAR(255) NOT NULL,

    CONSTRAINT "PK_f448a94c35218b6208ce20cf5a1" PRIMARY KEY ("metaId")
);

-- CreateTable
CREATE TABLE "public"."insights_raw" (
    "id" SERIAL NOT NULL,
    "metaId" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "timestamp" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_ec15125755151e3a7e00e00014f" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."installed_nodes" (
    "name" VARCHAR(200) NOT NULL,
    "type" VARCHAR(200) NOT NULL,
    "latestVersion" INTEGER NOT NULL DEFAULT 1,
    "package" VARCHAR(241) NOT NULL,

    CONSTRAINT "PK_8ebd28194e4f792f96b5933423fc439df97d9689" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "public"."installed_packages" (
    "packageName" VARCHAR(214) NOT NULL,
    "installedVersion" VARCHAR(50) NOT NULL,
    "authorName" VARCHAR(70),
    "authorEmail" VARCHAR(70),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_08cc9197c39b028c1e9beca225940576fd1a5804" PRIMARY KEY ("packageName")
);

-- CreateTable
CREATE TABLE "public"."invalid_auth_token" (
    "token" VARCHAR(512) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PK_5779069b7235b256d91f7af1a15" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "public"."invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" UUID NOT NULL,
    "invited_by_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."roles" NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" UUID NOT NULL,
    "content" TEXT,
    "role" "public"."message_roles" NOT NULL,
    "sources" JSON NOT NULL,
    "conversation_id" UUID NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    "is_breadth" BOOLEAN NOT NULL DEFAULT false,
    "rerank_enabled" BOOLEAN NOT NULL DEFAULT false,
    "prioritize_recent" BOOLEAN NOT NULL DEFAULT false,
    "slack_event" JSON,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."processed_data" (
    "workflowId" VARCHAR(36) NOT NULL,
    "context" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "value" TEXT NOT NULL,

    CONSTRAINT "PK_ca04b9d8dc72de268fe07a65773" PRIMARY KEY ("workflowId","context")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "public"."roles" NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."program" (
    "id" SERIAL NOT NULL,
    "degree_name" TEXT NOT NULL,
    "revision_year" VARCHAR(4) NOT NULL,
    "campus" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "thai_name" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "program_type" TEXT NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "icon" JSON,
    "description" VARCHAR(512),

    CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_relation" (
    "projectId" VARCHAR(36) NOT NULL,
    "userId" UUID NOT NULL,
    "role" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_1caaa312a5d7184a003be0f0cb6" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "loadOnStartup" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PK_dc0fe14e6d9943f268e7b119f69ab8bd" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."shared_credentials" (
    "credentialsId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(36) NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_8ef3a59796a228913f251779cff" PRIMARY KEY ("credentialsId","projectId")
);

-- CreateTable
CREATE TABLE "public"."shared_workflow" (
    "workflowId" VARCHAR(36) NOT NULL,
    "projectId" VARCHAR(36) NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_5ba87620386b847201c9531c58f" PRIMARY KEY ("workflowId","projectId")
);

-- CreateTable
CREATE TABLE "public"."student_area" (
    "rowid" SERIAL NOT NULL,
    "campus" VARCHAR(255) NOT NULL,
    "education_level" VARCHAR(500) NOT NULL,
    "year" VARCHAR(10) NOT NULL,
    "semester" VARCHAR(10) NOT NULL,
    "faculty" VARCHAR(255),
    "department" VARCHAR(255),
    "program" VARCHAR(500) NOT NULL,
    "programcode" VARCHAR(50) NOT NULL,
    "programtype" VARCHAR(100),
    "y1male" INTEGER DEFAULT 0,
    "y1female" INTEGER DEFAULT 0,
    "y1total" INTEGER DEFAULT 0,
    "y2male" INTEGER DEFAULT 0,
    "y2female" INTEGER DEFAULT 0,
    "y2total" INTEGER DEFAULT 0,
    "y3male" INTEGER DEFAULT 0,
    "y3female" INTEGER DEFAULT 0,
    "y3total" INTEGER DEFAULT 0,
    "y4male" INTEGER DEFAULT 0,
    "y4female" INTEGER DEFAULT 0,
    "y4total" INTEGER DEFAULT 0,
    "y5male" INTEGER DEFAULT 0,
    "y5female" INTEGER DEFAULT 0,
    "y5total" INTEGER DEFAULT 0,
    "holdmale" INTEGER DEFAULT 0,
    "holdfemale" INTEGER DEFAULT 0,
    "holdtotal" INTEGER DEFAULT 0,
    "totalmale" INTEGER DEFAULT 0,
    "totalfemale" INTEGER DEFAULT 0,
    "grandtotal" INTEGER DEFAULT 0,

    CONSTRAINT "student_area_pkey" PRIMARY KEY ("rowid")
);

-- CreateTable
CREATE TABLE "public"."student_overall" (
    "rowid" SERIAL NOT NULL,
    "campus" VARCHAR(500) NOT NULL,
    "faculty" VARCHAR(255) NOT NULL,
    "education_level" VARCHAR(100) NOT NULL,
    "year" VARCHAR(10) NOT NULL,
    "semester" VARCHAR(10) NOT NULL,
    "male" INTEGER DEFAULT 0,
    "female" INTEGER DEFAULT 0,
    "total" INTEGER,

    CONSTRAINT "student_overall_pkey" PRIMARY KEY ("rowid")
);

-- CreateTable
CREATE TABLE "public"."tag_entity" (
    "name" VARCHAR(24) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "id" VARCHAR(36) NOT NULL,

    CONSTRAINT "tag_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "question1" TEXT,
    "question2" TEXT,
    "question3" TEXT,
    "grounding_prompt" TEXT,
    "system_prompt" TEXT,
    "logo_file_name" TEXT,
    "logo_object_name" TEXT,
    "logo_url" TEXT,
    "slug" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "welcome_message" TEXT,
    "default_model" TEXT DEFAULT 'claude-sonnet-4-20250514',
    "is_breadth" BOOLEAN DEFAULT false,
    "rerank_enabled" BOOLEAN DEFAULT false,
    "prioritize_recent" BOOLEAN DEFAULT false,
    "override_breadth" BOOLEAN DEFAULT true,
    "override_rerank" BOOLEAN DEFAULT true,
    "override_prioritize_recent" BOOLEAN DEFAULT true,
    "ragie_api_key" TEXT,
    "ragie_partition" TEXT,
    "trial_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "paid_status" "public"."paid_status" NOT NULL DEFAULT 'trial',
    "partition_limit_exceeded_at" TIMESTAMPTZ(6),
    "metadata" JSONB DEFAULT '{}',
    "slack_enabled" BOOLEAN DEFAULT false,
    "slack_channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slack_bot_token" TEXT,
    "slack_team_id" TEXT,
    "slack_team_name" TEXT,
    "slack_response_mode" TEXT DEFAULT 'mentions',
    "disabled_models" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."test_case_execution" (
    "id" VARCHAR(36) NOT NULL,
    "testRunId" VARCHAR(36) NOT NULL,
    "executionId" INTEGER,
    "status" VARCHAR NOT NULL,
    "runAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "errorCode" VARCHAR,
    "errorDetails" JSON,
    "metrics" JSON,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_90c121f77a78a6580e94b794bce" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."test_run" (
    "id" VARCHAR(36) NOT NULL,
    "workflowId" VARCHAR(36) NOT NULL,
    "status" VARCHAR NOT NULL,
    "errorCode" VARCHAR,
    "errorDetails" JSON,
    "runAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "metrics" JSON,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "PK_011c050f566e9db509a0fadb9b9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" UUID NOT NULL DEFAULT uuid_in((OVERLAY(OVERLAY(md5((((random())::text || ':'::text) || (clock_timestamp())::text)) PLACING '4'::text FROM 13) PLACING to_hex((floor(((random() * (((11 - 8) + 1))::double precision) + (8)::double precision)))::integer) FROM 17))::cstring),
    "email" VARCHAR(255),
    "firstName" VARCHAR(32),
    "lastName" VARCHAR(32),
    "password" VARCHAR(255),
    "personalizationAnswers" JSON,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "settings" JSON,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaRecoveryCodes" TEXT,
    "role" TEXT NOT NULL,
    "lastActiveAt" DATE,

    CONSTRAINT "PK_ea8f538c94b6e352418254ed6474a81f" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_api_keys" (
    "id" VARCHAR(36) NOT NULL,
    "userId" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "apiKey" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "scopes" JSON,

    CONSTRAINT "PK_978fa5caa3468f463dac9d92e69" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "current_profile_id" UUID,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "slack_user_id" TEXT,
    "slack_user" JSON,
    "completed_welcome_flow_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."variables" (
    "key" VARCHAR(50) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'string',
    "value" VARCHAR(255),
    "id" VARCHAR(36) NOT NULL,

    CONSTRAINT "variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verifications" (
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_entity" (
    "webhookPath" VARCHAR NOT NULL,
    "method" VARCHAR NOT NULL,
    "node" VARCHAR NOT NULL,
    "webhookId" VARCHAR,
    "pathLength" INTEGER,
    "workflowId" VARCHAR(36) NOT NULL,

    CONSTRAINT "PK_b21ace2e13596ccd87dc9bf4ea6" PRIMARY KEY ("webhookPath","method")
);

-- CreateTable
CREATE TABLE "public"."workflow_entity" (
    "name" VARCHAR(128) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "nodes" JSON NOT NULL,
    "connections" JSON NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "settings" JSON,
    "staticData" JSON,
    "pinData" JSON,
    "versionId" CHAR(36),
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "id" VARCHAR(36) NOT NULL,
    "meta" JSON,
    "parentFolderId" VARCHAR(36),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workflow_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_history" (
    "versionId" VARCHAR(36) NOT NULL,
    "workflowId" VARCHAR(36) NOT NULL,
    "authors" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "nodes" JSON NOT NULL,
    "connections" JSON NOT NULL,

    CONSTRAINT "PK_b6572dd6173e4cd06fe79937b58" PRIMARY KEY ("versionId")
);

-- CreateTable
CREATE TABLE "public"."workflow_statistics" (
    "count" INTEGER DEFAULT 0,
    "latestEvent" TIMESTAMPTZ(3),
    "name" VARCHAR(128) NOT NULL,
    "workflowId" VARCHAR(36) NOT NULL,
    "rootCount" INTEGER DEFAULT 0,

    CONSTRAINT "pk_workflow_statistics" PRIMARY KEY ("workflowId","name")
);

-- CreateTable
CREATE TABLE "public"."workflows_tags" (
    "workflowId" VARCHAR(36) NOT NULL,
    "tagId" VARCHAR(36) NOT NULL,

    CONSTRAINT "pk_workflows_tags" PRIMARY KEY ("workflowId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "IDX_ae51b54c4bb430cf92f48b623f" ON "public"."annotation_tag_entity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "authenticators_credential_id_unique" ON "public"."authenticators"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "connections_ragie_connection_id_unique" ON "public"."connections"("ragie_connection_id");

-- CreateIndex
CREATE INDEX "conversations_profile_idx" ON "public"."conversations"("profile_id");

-- CreateIndex
CREATE INDEX "conversations_tenant_profile_idx" ON "public"."conversations"("tenant_id", "profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "pk_credentials_entity_id" ON "public"."credentials_entity"("id");

-- CreateIndex
CREATE INDEX "idx_07fde106c0b471d8cc80a64fc8" ON "public"."credentials_entity"("type");

-- CreateIndex
CREATE INDEX "IDX_a3697779b366e131b2bbdae297" ON "public"."execution_annotation_tags"("tagId");

-- CreateIndex
CREATE INDEX "IDX_c1519757391996eb06064f0e7c" ON "public"."execution_annotation_tags"("annotationId");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_97f863fa83c4786f1956508496" ON "public"."execution_annotations"("executionId");

-- CreateIndex
CREATE INDEX "IDX_execution_entity_deletedAt" ON "public"."execution_entity"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_cec8eea3bf49551482ccb4933e" ON "public"."execution_metadata"("executionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_14f68deffaf858465715995508" ON "public"."folder"("projectId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_60b6a84299eeb3f671dfec7693" ON "public"."insights_by_period"("periodStart", "type", "periodUnit", "metaId");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_1d8ab99d5861c9388d2dc1cf73" ON "public"."insights_metadata"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "invites_tenant_id_email_unique" ON "public"."invites"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "messages_conversation_idx" ON "public"."messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_tenant_conversation_idx" ON "public"."messages"("tenant_id", "conversation_id");

-- CreateIndex
CREATE INDEX "profiles_role_idx" ON "public"."profiles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_tenant_id_user_id_unique" ON "public"."profiles"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "IDX_5f0643f6717905a05164090dde" ON "public"."project_relation"("userId");

-- CreateIndex
CREATE INDEX "IDX_61448d56d61802b5dfde5cdb00" ON "public"."project_relation"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_unique" ON "public"."sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "idx_812eb05f7451ca757fb98444ce" ON "public"."tag_entity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pk_tag_entity_id" ON "public"."tag_entity"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_unique" ON "public"."tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slack_team_id_unique" ON "public"."tenants"("slack_team_id");

-- CreateIndex
CREATE INDEX "tenants_paid_status_idx" ON "public"."tenants"("paid_status");

-- CreateIndex
CREATE INDEX "IDX_8e4b4774db42f1e6dda3452b2a" ON "public"."test_case_execution"("testRunId");

-- CreateIndex
CREATE INDEX "IDX_d6870d3b6e4c185d33926f423c" ON "public"."test_run"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_e12875dfb3b1d92d7d7c5377e2" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_1ef35bac35d20bdae979d917a3" ON "public"."user_api_keys"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_63d7bbae72c767cf162d459fcc" ON "public"."user_api_keys"("userId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slack_user_id_unique" ON "public"."users"("slack_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "variables_key_key" ON "public"."variables"("key");

-- CreateIndex
CREATE UNIQUE INDEX "pk_variables_id" ON "public"."variables"("id");

-- CreateIndex
CREATE INDEX "idx_16f4436789e804e3e1c9eeb240" ON "public"."webhook_entity"("webhookId", "method", "pathLength");

-- CreateIndex
CREATE UNIQUE INDEX "pk_workflow_entity_id" ON "public"."workflow_entity"("id");

-- CreateIndex
CREATE INDEX "IDX_workflow_entity_name" ON "public"."workflow_entity"("name");

-- CreateIndex
CREATE INDEX "IDX_1e31657f5fe46816c34be7c1b4" ON "public"."workflow_history"("workflowId");

-- CreateIndex
CREATE INDEX "idx_workflows_tags_workflow_id" ON "public"."workflows_tags"("workflowId");

-- AddForeignKey
ALTER TABLE "public"."n8n_chat_histories" ADD CONSTRAINT "n8n_chat_histories_chats_fk" FOREIGN KEY ("session_id") REFERENCES "passprism"."Chats"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "passprism"."Chats" ADD CONSTRAINT "Chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "passprism"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."auth_identity" ADD CONSTRAINT "auth_identity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."execution_annotation_tags" ADD CONSTRAINT "FK_a3697779b366e131b2bbdae2976" FOREIGN KEY ("tagId") REFERENCES "public"."annotation_tag_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."execution_annotation_tags" ADD CONSTRAINT "FK_c1519757391996eb06064f0e7c8" FOREIGN KEY ("annotationId") REFERENCES "public"."execution_annotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."execution_annotations" ADD CONSTRAINT "FK_97f863fa83c4786f19565084960" FOREIGN KEY ("executionId") REFERENCES "public"."execution_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."execution_data" ADD CONSTRAINT "execution_data_fk" FOREIGN KEY ("executionId") REFERENCES "public"."execution_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."execution_entity" ADD CONSTRAINT "fk_execution_entity_workflow_id" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."execution_metadata" ADD CONSTRAINT "FK_31d0b4c93fb85ced26f6005cda3" FOREIGN KEY ("executionId") REFERENCES "public"."execution_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."folder" ADD CONSTRAINT "FK_804ea52f6729e3940498bd54d78" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."folder" ADD CONSTRAINT "FK_a8260b0b36939c6247f385b8221" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."folder_tag" ADD CONSTRAINT "FK_94a60854e06f2897b2e0d39edba" FOREIGN KEY ("folderId") REFERENCES "public"."folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."folder_tag" ADD CONSTRAINT "FK_dc88164176283de80af47621746" FOREIGN KEY ("tagId") REFERENCES "public"."tag_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."insights_by_period" ADD CONSTRAINT "FK_6414cfed98daabbfdd61a1cfbc0" FOREIGN KEY ("metaId") REFERENCES "public"."insights_metadata"("metaId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."insights_metadata" ADD CONSTRAINT "FK_1d8ab99d5861c9388d2dc1cf733" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."insights_metadata" ADD CONSTRAINT "FK_2375a1eda085adb16b24615b69c" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."insights_raw" ADD CONSTRAINT "FK_6e2e33741adef2a7c5d66befa4e" FOREIGN KEY ("metaId") REFERENCES "public"."insights_metadata"("metaId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."installed_nodes" ADD CONSTRAINT "FK_73f857fc5dce682cef8a99c11dbddbc969618951" FOREIGN KEY ("package") REFERENCES "public"."installed_packages"("packageName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_invited_by_id_profiles_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."processed_data" ADD CONSTRAINT "FK_06a69a7032c97a763c2c7599464" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."project_relation" ADD CONSTRAINT "FK_5f0643f6717905a05164090dde7" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."project_relation" ADD CONSTRAINT "FK_61448d56d61802b5dfde5cdb002" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shared_credentials" ADD CONSTRAINT "FK_416f66fc846c7c442970c094ccf" FOREIGN KEY ("credentialsId") REFERENCES "public"."credentials_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shared_credentials" ADD CONSTRAINT "FK_812c2852270da1247756e77f5a4" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shared_workflow" ADD CONSTRAINT "FK_a45ea5f27bcfdc21af9b4188560" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shared_workflow" ADD CONSTRAINT "FK_daa206a04983d47d0a9c34649ce" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."test_case_execution" ADD CONSTRAINT "FK_8e4b4774db42f1e6dda3452b2af" FOREIGN KEY ("testRunId") REFERENCES "public"."test_run"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."test_case_execution" ADD CONSTRAINT "FK_e48965fac35d0f5b9e7f51d8c44" FOREIGN KEY ("executionId") REFERENCES "public"."execution_entity"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."test_run" ADD CONSTRAINT "FK_d6870d3b6e4c185d33926f423c8" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_api_keys" ADD CONSTRAINT "FK_e131705cbbc8fb589889b02d457" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_current_profile_id_profiles_id_fk" FOREIGN KEY ("current_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."webhook_entity" ADD CONSTRAINT "fk_webhook_entity_workflow_id" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workflow_entity" ADD CONSTRAINT "fk_workflow_parent_folder" FOREIGN KEY ("parentFolderId") REFERENCES "public"."folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workflow_history" ADD CONSTRAINT "FK_1e31657f5fe46816c34be7c1b4b" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workflow_statistics" ADD CONSTRAINT "fk_workflow_statistics_workflow_id" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workflows_tags" ADD CONSTRAINT "fk_workflows_tags_tag_id" FOREIGN KEY ("tagId") REFERENCES "public"."tag_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."workflows_tags" ADD CONSTRAINT "fk_workflows_tags_workflow_id" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
