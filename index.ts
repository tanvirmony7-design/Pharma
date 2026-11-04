import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();
const SELL_ROLES = new Set(["super_admin", "admin", "manager", "sales"]);

/** Creates a sale and decrements stock atomically on the server. Never trust client totals. */
export const createSale = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Please sign in.");
  const uid = request.auth.uid;
  const profileSnap = await db.collection("users").doc(uid).get();
  const profile = profileSnap.data();
  if (!profile || profile.active !== true || !SELL_ROLES.has(String(profile.role))) {
    throw new HttpsError("permission-denied", "You are not allowed to create sales.");
  }

  const branchId = String(request.data?.branchId ?? "");
  const customerId = String(request.data?.customerId ?? "walk-in");
  const lines = request.data?.lines;
  if (!branchId || !Array.isArray(lines) || lines.length < 1 || lines.length > 100) {
    throw new HttpsError("invalid-argument", "A branch and 1–100 sale lines are required.");
  }
  if (!Array.isArray(profile.branchIds) || !profile.branchIds.includes(branchId)) {
    throw new HttpsError("permission-denied", "This branch is not assigned to your account.");
  }

  const normalized = lines.map((line: any) => ({
    medicineId: String(line?.medicineId ?? ""),
    quantity: Number(line?.quantity ?? 0),
  }));
  if (normalized.some((x: {medicineId: string; quantity: number}) => !x.medicineId || !Number.isSafeInteger(x.quantity) || x.quantity <= 0)) {
    throw new HttpsError("invalid-argument", "Each item needs a medicine ID and positive whole quantity.");
  }
  if (new Set(normalized.map((x: {medicineId: string}) => x.medicineId)).size !== normalized.length) {
    throw new HttpsError("invalid-argument", "A medicine may appear only once per sale request.");
  }
  const saleRef = db.collection("sales").doc();
  const result = await db.runTransaction(async (tx) => {
    const refs = normalized.map((x: {medicineId: string}) => db.collection("medicines").doc(x.medicineId));
    const snaps = await Promise.all(refs.map((ref) => tx.get(ref)));
    let total = 0;
    const saleLines: Array<Record<string, unknown>> = [];
    snaps.forEach((snap, index) => {
      const item = normalized[index];
      const medicine = snap.data();
      if (!snap.exists || !medicine || medicine.branchId !== branchId) throw new HttpsError("not-found", "Medicine not found in this branch.");
      const stock = Number(medicine.quantity ?? 0);
      const price = Number(medicine.unitPrice ?? 0);
      if (!Number.isFinite(price) || price < 0 || stock < item.quantity) throw new HttpsError("failed-precondition", "Insufficient stock or invalid price.");
      const lineTotal = price * item.quantity;
      total += lineTotal;
      saleLines.push({ medicineId: snap.id, medicineName: medicine.name ?? "", batchNo: medicine.batchNo ?? "", quantity: item.quantity, unitPrice: price, lineTotal });
      tx.update(refs[index], { quantity: stock - item.quantity, updatedAt: FieldValue.serverTimestamp() });
    });
    tx.create(saleRef, { branchId, customerId, lines: saleLines, total, createdBy: uid, createdAt: FieldValue.serverTimestamp() });
    const auditRef = db.collection("auditLogs").doc();
    tx.create(auditRef, { branchId, actorUid: uid, action: "SALE_CREATED", entityId: saleRef.id, createdAt: FieldValue.serverTimestamp() });
    return { saleId: saleRef.id, total };
  });
  return result;
});
