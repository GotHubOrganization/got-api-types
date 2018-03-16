import { Component, HttpStatus } from '@nestjs/common';
import { Config } from '../config';
import { HttpException } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotTypeDto } from './dto/got-type.dto';

@Component()
export class GotTypeService {

    /**
     * constructor
     */
    constructor(private s3Utils: S3Utils) {
    }

    /**
     * puts a Type Object to S3
     * Must return a promise to build a promise chain
     * @param gotType
     * @returns Promise<any>
     */
    public put(gotType: GotTypeDto): Promise<any> {
        return this.s3Utils.putObjectToS3(gotType.name, gotType,
            { ServerSideEncryption: 'aws:kms' })
            .then((response) => {
                console.log('S3 storage response ' + JSON.stringify(response));
                return { id: gotType.name };
            });
    }

    /**
     * returns a type object to the corresponding key from the S3 cache
     * Must return a promise to build a promise chain
     * @param gotTypeName
     */
    public get(gotTypeName: string): Promise<GotTypeDto> {
        return this.s3Utils.getObjectFromS3(gotTypeName)
            .then(result => {
                return JSON.parse('' + result);
            })
            .catch(err => {
                throw new HttpException(err,
                    HttpStatus.NOT_FOUND);
            });
    }

}
