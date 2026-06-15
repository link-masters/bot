// lib/appwrite/setup-db.ts
// Run this once to create all collections
import { createAdminClient } from "./server";
import {
  Permission,
  Role,
} from "node-appwrite";

export async function setupDatabase() {
  const { databases } = createAdminClient();
  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

  // Create Database
  await databases.create(DB_ID, "WhatsApp SaaS DB");

  // ==================== USERS COLLECTION ====================
  await databases.createCollection(
    DB_ID,
    "users",
    "Users",
    [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ]
  );

  await databases.createStringAttribute(DB_ID, "users", "userId", 255, true);
  await databases.createStringAttribute(DB_ID, "users", "name", 255, true);
  await databases.createStringAttribute(DB_ID, "users", "email", 255, true);
  await databases.createStringAttribute(DB_ID, "users", "avatar", 500, false);
  await databases.createStringAttribute(DB_ID, "users", "plan", 50, true, "starter");

  await databases.createStringAttribute(DB_ID, "users", "subscriptionStatus", 50, false, "inactive");
  await databases.createIntegerAttribute(DB_ID, "users", "messageCount", false, 0);
  await databases.createIntegerAttribute(DB_ID, "users", "messageLimit", false, 1000);
  await databases.createBooleanAttribute(DB_ID, "users", "isActive", false, true);
  await databases.createDatetimeAttribute(DB_ID, "users", "trialEndsAt", false);
  await databases.createDatetimeAttribute(DB_ID, "users", "createdAt", true);

  // ==================== BOTS COLLECTION ====================
  await databases.createCollection(DB_ID, "bots", "Bots");

  await databases.createStringAttribute(DB_ID, "bots", "userId", 255, true);
  await databases.createStringAttribute(DB_ID, "bots", "name", 255, true);
  await databases.createStringAttribute(DB_ID, "bots", "description", 1000, false);
  await databases.createStringAttribute(DB_ID, "bots", "phoneNumber", 50, false);
  await databases.createStringAttribute(DB_ID, "bots", "status", 50, true, "inactive");
  // status: active | inactive | connecting | banned
  await databases.createStringAttribute(DB_ID, "bots", "openwaInstanceId", 255, false);
  await databases.createStringAttribute(DB_ID, "bots", "n8nWorkflowId", 255, false);
  await databases.createStringAttribute(DB_ID, "bots", "webhookUrl", 500, false);
  await databases.createStringAttribute(DB_ID, "bots", "aiModel", 50, false, "gemini-pro");
  await databases.createStringAttribute(DB_ID, "bots", "systemPrompt", 5000, false);
  await databases.createStringAttribute(DB_ID, "bots", "welcomeMessage", 1000, false);
  await databases.createBooleanAttribute(DB_ID, "bots", "isActive", false, true);
  await databases.createIntegerAttribute(DB_ID, "bots", "totalMessages", false, 0);
  await databases.createStringAttribute(DB_ID, "bots", "avatar", 500, false);
  await databases.createDatetimeAttribute(DB_ID, "bots", "lastActiveAt", false);
  await databases.createDatetimeAttribute(DB_ID, "bots", "createdAt", true);

  // ==================== CONVERSATIONS COLLECTION ====================
  await databases.createCollection(DB_ID, "conversations", "Conversations");

  await databases.createStringAttribute(DB_ID, "conversations", "botId", 255, true);
  await databases.createStringAttribute(DB_ID, "conversations", "userId", 255, true);
  await databases.createStringAttribute(DB_ID, "conversations", "contactNumber", 50, true);
  await databases.createStringAttribute(DB_ID, "conversations", "contactName", 255, false);
  await databases.createStringAttribute(DB_ID, "conversations", "lastMessage", 1000, false);
  await databases.createStringAttribute(DB_ID, "conversations", "status", 50, false, "active");
  await databases.createIntegerAttribute(DB_ID, "conversations", "messageCount", false, 0);
  await databases.createBooleanAttribute(DB_ID, "conversations", "isRead", false, false);
  await databases.createDatetimeAttribute(DB_ID, "conversations", "lastMessageAt", false);
  await databases.createDatetimeAttribute(DB_ID, "conversations", "createdAt", true);

  // ==================== MESSAGES COLLECTION ====================
  await databases.createCollection(DB_ID, "messages", "Messages");

  await databases.createStringAttribute(DB_ID, "messages", "conversationId", 255, true);
  await databases.createStringAttribute(DB_ID, "messages", "botId", 255, true);
  await databases.createStringAttribute(DB_ID, "messages", "content", 5000, true);
  await databases.createStringAttribute(DB_ID, "messages", "role", 50, true);
  // role: user | assistant
  await databases.createStringAttribute(DB_ID, "messages", "messageType", 50, false, "text");
  await databases.createStringAttribute(DB_ID, "messages", "mediaUrl", 500, false);
  await databases.createBooleanAttribute(DB_ID, "messages", "isDelivered", false, false);
  await databases.createDatetimeAttribute(DB_ID, "messages", "createdAt", true);

  // ==================== SUBSCRIPTIONS COLLECTION ====================
  await databases.createCollection(DB_ID, "subscriptions", "Subscriptions");

  await databases.createStringAttribute(DB_ID, "subscriptions", "userId", 255, true);
  await databases.createStringAttribute(DB_ID, "subscriptions", "plan", 50, true);
  await databases.createStringAttribute(DB_ID, "subscriptions", "status", 50, true);
  await databases.createIntegerAttribute(DB_ID, "subscriptions", "amount", false, 0);
  await databases.createStringAttribute(DB_ID, "subscriptions", "currency", 10, false, "usd");
  await databases.createDatetimeAttribute(DB_ID, "subscriptions", "currentPeriodStart", false);
  await databases.createDatetimeAttribute(DB_ID, "subscriptions", "currentPeriodEnd", false);
  await databases.createDatetimeAttribute(DB_ID, "subscriptions", "cancelAtPeriodEnd", false);
  await databases.createDatetimeAttribute(DB_ID, "subscriptions", "createdAt", true);

  // ==================== ANALYTICS COLLECTION ====================
  await databases.createCollection(DB_ID, "analytics", "Analytics");

  await databases.createStringAttribute(DB_ID, "analytics", "userId", 255, true);
  await databases.createStringAttribute(DB_ID, "analytics", "botId", 255, false);
  await databases.createStringAttribute(DB_ID, "analytics", "date", 20, true);
  await databases.createIntegerAttribute(DB_ID, "analytics", "totalMessages", false, 0);
  await databases.createIntegerAttribute(DB_ID, "analytics", "totalConversations", false, 0);
  await databases.createIntegerAttribute(DB_ID, "analytics", "newContacts", false, 0);
  await databases.createIntegerAttribute(DB_ID, "analytics", "successfulResponses", false, 0);
  await databases.createIntegerAttribute(DB_ID, "analytics", "failedResponses", false, 0);
  await databases.createDatetimeAttribute(DB_ID, "analytics", "createdAt", true);

  console.log("✅ Database setup complete!");
}
