"use client";

import { CreatePengukuranPayload, Pengukuran } from "@/types";

const DB_NAME = "simgizi_offline_db";
const STORE_NAME = "pending_pengukuran";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB tidak didukung pada environment ini."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "clientUuid" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineQueue = {
  async add(payload: CreatePengukuranPayload): Promise<void> {
    try {
      const db = await openDB();
      const clientUuid = payload.clientUuid || crypto.randomUUID();
      const record = { ...payload, clientUuid, savedAt: Date.now() };

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn("Gagal simpan ke IndexedDB offline:", err);
    }
  },

  async getAll(): Promise<CreatePengukuranPayload[]> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  },

  async remove(clientUuid: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(clientUuid);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn("Gagal delete dari IndexedDB:", err);
    }
  },

  async count(): Promise<number> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return 0;
    }
  },

  async flush(): Promise<{ synced: number; failed: number }> {
    const items = await this.getAll();
    let synced = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const res = await fetch("/api/pengukuran", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (res.ok) {
          if (item.clientUuid) {
            await this.remove(item.clientUuid);
          }
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { synced, failed };
  },
};
