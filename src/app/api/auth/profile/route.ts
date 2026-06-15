import { NextRequest, NextResponse } from "next/server";
import { Client, Account, Users, Databases, Query } from "node-appwrite";

function adminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return {
    account: new Account(client),
    users: new Users(client),
    databases: new Databases(client),
  };
}

function sessionClient(secret: string) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setSession(secret);
  return { account: new Account(client) };
}

export async function PATCH(req: NextRequest) {
  const session = req.cookies.get("appwrite-session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, currentPassword, newPassword } = body as {
      name?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    // Verify session and get userId
    const { account: sessionAcc } = sessionClient(session);
    const authUser = await sessionAcc.get();

    const { users, databases } = adminClient();

    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const USERS_COL = process.env.NEXT_PUBLIC_COLLECTION_USERS!;

    if (name && name.trim()) {
      await users.updateName(authUser.$id, name.trim());
      // Sync name in DB document
      const docs = await databases.listDocuments(DB_ID, USERS_COL, [
        Query.equal("userId", authUser.$id),
        Query.limit(1),
      ]);
      if (docs.documents.length > 0) {
        await databases.updateDocument(DB_ID, USERS_COL, docs.documents[0].$id, {
          name: name.trim(),
        });
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password required to set a new password." },
          { status: 400 }
        );
      }
      // Verify current password by attempting a session with it
      const { account: anonAcc } = (() => {
        const c = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
          .setKey(process.env.APPWRITE_API_KEY!);
        return { account: new Account(c) };
      })();
      try {
        const tempSession = await anonAcc.createEmailPasswordSession(
          authUser.email,
          currentPassword
        );
        // Verified — delete the temp session immediately
        const { account: tempAcc } = sessionClient(tempSession.secret);
        await tempAcc.deleteSession("current").catch(() => {});
      } catch {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 }
        );
      }
      await users.updatePassword(authUser.$id, newPassword);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
