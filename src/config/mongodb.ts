/* eslint-disable prefer-const */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false, // Set to true only for debugging (not recommended in production)
  tlsCAFile: undefined, // Specify path to CA certificate if needed
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  connectTimeoutMS: 10000, // Timeout for connection
  socketTimeoutMS: 20000, // Timeout for socket
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

client = new MongoClient(uri, options);
clientPromise = client.connect();

export default clientPromise;