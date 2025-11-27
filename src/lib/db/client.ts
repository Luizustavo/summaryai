import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;

if (!uri) {
  throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
}

// Configurações otimizadas para Vercel e MongoDB Atlas
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

const client = new MongoClient(uri, options);

export const DATABASE_NAME = 'faqdb';

// Cache da conexão para ambientes serverless
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!cachedClient) {
    cachedClient = await client.connect();
  }

  cachedDb = cachedClient.db(DATABASE_NAME);
  return { client: cachedClient, db: cachedDb };
}

export default client;