import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { UserModel } from '../modules/users/user.model.js';

export async function removeLegacyUsernameIndex(): Promise<void> {
  if (UserModel.schema.path('username')) {
    return;
  }

  const collection = UserModel.collection;
  const database = UserModel.db.db;

  if (!database) {
    throw new Error('MongoDB connection is not initialized');
  }

  const collectionExists = await database
    .listCollections({ name: collection.collectionName }, { nameOnly: true })
    .hasNext();

  if (!collectionExists) {
    return;
  }

  const indexes = await collection.indexes();
  const legacyIndex = indexes.find(
    (index) =>
      index.unique === true &&
      index.sparse !== true &&
      index.partialFilterExpression === undefined &&
      Object.keys(index.key).length === 1 &&
      index.key.username === 1,
  );

  if (!legacyIndex) {
    return;
  }

  if (!legacyIndex.name) {
    throw new Error('Cannot remove the legacy username index because it has no name');
  }

  await collection.dropIndex(legacyIndex.name);
  logger.warn({ index: legacyIndex.name }, 'Removed obsolete unique username index');
}

export async function connectDB(uri: string = env.MONGODB_URI): Promise<void> {
  try {
    await mongoose.connect(uri);
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }

  await removeLegacyUsernameIndex();
  logger.info(
    {
      uri: uri.replace(/\/\/.*@/, '//<redacted>@'),
      database: mongoose.connection.name,
    },
    'Connected to MongoDB',
  );
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
}
