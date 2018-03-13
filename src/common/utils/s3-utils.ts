import * as aws from 'aws-sdk';
import { S3 } from 'aws-sdk';
import GetObjectRequest = S3.GetObjectRequest;
import { HttpException } from '@nestjs/core';
import { HttpStatus } from '@nestjs/common';

export class S3Utils {

    /**
     * constructor that automatically creates the s3 Bucket
     * @param s3BucketName
     * @param region
     */
    constructor(private s3: S3,
                private s3BucketName: string) {
    }

    /**
     * returns the region
     * @returns {S3}
     */
    public getBucketName(): string {
        return this.s3BucketName;
    }

    /**
     * creates the s3 Bucket
     * @param region
     * @returns {S3}
     */
    public getS3(): aws.S3 {
        return this.s3;
    }

    /**
     * access the S3 Bucket and searches the object depending on request parameter
     * Returns an error if it is not found
     * @param params
     * @param s3Bucket
     * @param region
     * @returns {Promise<string>}
     */
    public getObjectFromS3(key: string): Promise<string> {
        return this.s3.getObject(this.getS3Params(key))
            .promise()
            .then((data: aws.S3.Types.GetObjectOutput) => {
                console.log(`Found Entry ${data.Body.toString()}`);
                return data.Body.toString();
            })
            .catch(() => {
                console.log(`Not Found Entry`);
                throw new HttpException('Not found entry' ,
                HttpStatus.NOT_FOUND);
            });

    }

    /**
     * put an object as JSON to the S3 Bucket
     * Returns a Promise
     * @param key - the object filename
     * @param object - contains the object data as json
     * @param payloadOverrides - Overrides of payload
     * @returns {Promise<aws.S3.Types.PutObjectOutput>}
     */
    public putObjectToS3(key: string,
                         object: any,
                         payloadOverrides: any = {}): Promise<aws.S3.Types.PutObjectOutput> {
        const payload = Object.assign({
            Bucket: this.s3BucketName,
            Key: key,
            Body: JSON.stringify(object)
        }, payloadOverrides);
        return this.s3.putObject(payload).promise();
    }

    /**
     * Deletes an Object from S3
     * @param key
     */
    public deleteObjectFromS3(key: string): Promise<aws.S3.Types.DeleteObjectOutput> {
        const payload = { Bucket: this.s3BucketName, Key: key };
        return this.s3.deleteObject(payload).promise();
    }

    /**
     * list objects for s3 bucket
     * @param bucket Bucketname
     * @returns {Promise<S3.Types.ListObjectsV2Output>}
     */
    public listObjectsInBucket(bucket: string): Promise<aws.S3.Types.ListObjectsOutput> {
        const payload = { Bucket: this.s3BucketName };
        return this.s3.listObjectsV2(payload).promise();
    }

    /**
     * creates S3 ConnectionParams
     * @param key
     * @returns {{Bucket: string, Key: string}}
     */
    private getS3Params(key: string): GetObjectRequest {
        return {
            Bucket: this.s3BucketName,
            Key: key,

        };
    }
}
