import AWS from 'aws-sdk';
import { constants } from '../../config';

var s3 = new AWS.S3(
  process.env.AWS_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      }
    : undefined
);

export const listDirectories = (): Promise<AWS.S3.ListObjectsV2Output> => {
  if (!constants.awsBucket || !constants.awsPrefix) {
    throw new Error('awsBucket or awsPrefix unset ');
  }

  return new Promise((resolve, reject) => {
    const s3params: AWS.S3.ListObjectsV2Request = {
      Bucket: constants.awsBucket!,
      MaxKeys: 1000,
      Delimiter: '/',
      Prefix: constants.awsPrefix!,
    };
    s3.listObjectsV2(s3params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

export const getObject = (key: string): Promise<AWS.S3.GetObjectOutput> => {
  if (!constants.awsBucket || !constants.awsPrefix) {
    throw new Error('awsBucket or awsPrefix unset ');
  }

  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: constants.awsBucket!,
        Key: key,
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

export const uploadObject = (
  key: string,
  data: Buffer
): Promise<AWS.S3.ManagedUpload.SendData> => {
  if (!constants.awsBucket || !constants.awsPrefix) {
    throw new Error('awsBucket or awsPrefix unset ');
  }

  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: constants.awsBucket!,
        Key: key,
        Body: data,
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

export const uploadObjects = (
  buffers: Buffer[],
  paths: string[]
): Promise<AWS.S3.ManagedUpload.SendData>[] => {
  const promises = [];
  for (const [i, buffer] of buffers.entries()) {
    promises.push(uploadObject(paths[i], buffer));
  }
  return promises;
};
