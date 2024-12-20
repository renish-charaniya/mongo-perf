import mongoose from 'mongoose';
let dbConnect;

const dbURI = process.env.MONGO_DB_URL
  ? { mongouri: process.env.MONGO_DB_URL, isLocal: false }
  : { mongouri: 'mongodb://localhost/scannedJobs', isLocal: true };

export class DBconnection {
  public static connect = async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        dbConnect = mongoose.connection;
      } else {
        dbConnect = await mongoose.connect(dbURI.mongouri, {
          dbName: process.env.DB_NAME ?? 'notenv',
        });

        console.debug(`DBconnection - success - isLocal > ${dbURI.isLocal}`);
      }
    } catch (error) {
      console.error('DBconnection - error');
      throw new Error(`${error}`);
    }
    return dbConnect;
  };
}
