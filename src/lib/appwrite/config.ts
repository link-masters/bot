// lib/appwrite/config.ts
import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client };

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_COLLECTION_USERS!,
  BOTS: process.env.NEXT_PUBLIC_COLLECTION_BOTS!,
  CONVERSATIONS: process.env.NEXT_PUBLIC_COLLECTION_CONVERSATIONS!,
  MESSAGES: process.env.NEXT_PUBLIC_COLLECTION_MESSAGES!,
  SUBSCRIPTIONS: process.env.NEXT_PUBLIC_COLLECTION_SUBSCRIPTIONS!,
  ANALYTICS: process.env.NEXT_PUBLIC_COLLECTION_ANALYTICS!,
  SESSIONS: process.env.NEXT_PUBLIC_COLLECTION_SESSIONS!,
};
