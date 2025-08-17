import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI!;
let cachedDb: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = await mongoose.connect(uri);
  cachedDb = client;
  return client;
}

const viewSchema = new mongoose.Schema({
  ipHash: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const View = mongoose.models.View || mongoose.model('View', viewSchema);

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    await connectToDatabase();

    const uniqueViews = await View.countDocuments();

    const responseData = {
      schemaVersion: 1,
      label: "Unique Views",
      message: uniqueViews.toString(),
      color: "green",
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in views API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
