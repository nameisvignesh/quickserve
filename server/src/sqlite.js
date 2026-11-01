import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

function dateValue(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function userFromRow(row) {
  const user = {
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    passwordHash: row.password_hash,
    phoneVerified: Boolean(row.phone_verified),
    role: row.role,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
  };
  if (row.clerk_id) user.clerkId = row.clerk_id;
  if (row.otp_hash) user.otpHash = row.otp_hash;
  if (row.otp_expires_at) user.otpExpiresAt = new Date(row.otp_expires_at);
  if (row.photo_proof) user.photoProof = row.photo_proof;
  if (row.signature_proof) user.signatureProof = row.signature_proof;
  return user;
}

export function createSqliteStore() {
  const filename = process.env.SQLITE_PATH || path.resolve(process.cwd(), "data", "quickserve.sqlite");
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new Database(filename);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      clerk_id TEXT UNIQUE,
      phone_verified INTEGER NOT NULL DEFAULT 0,
      otp_hash TEXT,
      otp_expires_at TEXT,
      photo_proof TEXT,
      signature_proof TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);
    CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
  `);

  const selectUsers = db.prepare("SELECT * FROM users ORDER BY created_at ASC");
  const saveUser = db.prepare(`
    INSERT INTO users (
      id, name, email, phone, password_hash, clerk_id, phone_verified,
      otp_hash, otp_expires_at, photo_proof, signature_proof, role, created_at, updated_at
    ) VALUES (
      @id, @name, @email, @phone, @passwordHash, @clerkId, @phoneVerified,
      @otpHash, @otpExpiresAt, @photoProof, @signatureProof, @role, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      phone = excluded.phone,
      password_hash = excluded.password_hash,
      clerk_id = excluded.clerk_id,
      phone_verified = excluded.phone_verified,
      otp_hash = excluded.otp_hash,
      otp_expires_at = excluded.otp_expires_at,
      photo_proof = excluded.photo_proof,
      signature_proof = excluded.signature_proof,
      role = excluded.role,
      updated_at = excluded.updated_at
  `);

  return {
    filename,
    loadUsers() {
      return selectUsers.all().map(userFromRow);
    },
    saveUser(user) {
      const plain = typeof user?.toObject === "function" ? user.toObject() : user;
      if (!plain?._id || !plain.email || !plain.passwordHash) return;
      const now = dateValue(plain.updatedAt) || new Date().toISOString();
      saveUser.run({
        id: String(plain._id),
        name: String(plain.name || "QuickServe customer"),
        email: String(plain.email).trim().toLowerCase(),
        phone: plain.phone ? String(plain.phone) : null,
        passwordHash: String(plain.passwordHash),
        clerkId: plain.clerkId ? String(plain.clerkId) : null,
        phoneVerified: plain.phoneVerified ? 1 : 0,
        otpHash: plain.otpHash ? String(plain.otpHash) : null,
        otpExpiresAt: dateValue(plain.otpExpiresAt),
        photoProof: plain.photoProof ? String(plain.photoProof) : null,
        signatureProof: plain.signatureProof ? String(plain.signatureProof) : null,
        role: String(plain.role || "customer"),
        createdAt: dateValue(plain.createdAt) || now,
        updatedAt: now
      });
    }
  };
}
