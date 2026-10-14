import mongoose from 'mongoose';

// Cache the connection so it is reused across hot reloads and serverless invocations
const cache = globalThis.__mongoCache || (globalThis.__mongoCache = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGODB_URI, { bufferCommands: false })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
