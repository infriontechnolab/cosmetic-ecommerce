import { db } from "@/db";
import { users, addresses } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export type UserProfile = {
  name: string;
  email: string;
  phone: string | null;
  loyaltyPoints: number;
};

export type Address = {
  id: number;
  addressType: "billing" | "shipping" | "both";
  isDefault: boolean | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark: string | null;
};

export type AddressInput = {
  addressType?: "billing" | "shipping" | "both";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  landmark?: string;
};

export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  const rows = await db
    .select({ name: users.name, email: users.email, phone: users.phone, loyaltyPoints: users.loyaltyPoints })
    .from(users)
    .where(and(eq(users.id, userId), sql`${users.deletedAt} IS NULL`))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateUserProfile(
  userId: number,
  data: { name?: string; phone?: string }
): Promise<void> {
  await db
    .update(users)
    .set({ ...(data.name !== undefined ? { name: data.name } : {}), ...(data.phone !== undefined ? { phone: data.phone } : {}), updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function getUserAddresses(userId: number): Promise<Address[]> {
  return db
    .select({
      id: addresses.id,
      addressType: addresses.addressType,
      isDefault: addresses.isDefault,
      fullName: addresses.fullName,
      phone: addresses.phone,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      pincode: addresses.pincode,
      country: addresses.country,
      landmark: addresses.landmark,
    })
    .from(addresses)
    .where(and(eq(addresses.userId, userId), sql`${addresses.deletedAt} IS NULL`));
}

export async function createUserAddress(
  userId: number,
  data: AddressInput
): Promise<{ id: number }> {
  const [result] = await db.insert(addresses).values({
    userId,
    addressType: data.addressType ?? "both",
    fullName: data.fullName,
    phone: data.phone,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2 ?? null,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    country: data.country ?? "India",
    landmark: data.landmark ?? null,
    isDefault: false,
  });
  return { id: Number(result.insertId) };
}

export async function updateUserAddress(
  addressId: number,
  userId: number,
  data: Partial<AddressInput>
): Promise<void> {
  await db
    .update(addresses)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId), sql`${addresses.deletedAt} IS NULL`));
}

export async function deleteUserAddress(addressId: number, userId: number): Promise<void> {
  await db
    .update(addresses)
    .set({ deletedAt: new Date() })
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
}

export async function deductLoyaltyPoints(userId: number, points: number): Promise<void> {
  await db
    .update(users)
    .set({ loyaltyPoints: sql`${users.loyaltyPoints} - ${points}`, updatedAt: new Date() })
    .where(and(eq(users.id, userId), sql`${users.loyaltyPoints} >= ${points}`));
}

export async function setDefaultAddress(addressId: number, userId: number): Promise<void> {
  // Clear existing default
  await db
    .update(addresses)
    .set({ isDefault: false })
    .where(and(eq(addresses.userId, userId), sql`${addresses.deletedAt} IS NULL`));
  // Set new default
  await db
    .update(addresses)
    .set({ isDefault: true })
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
}
