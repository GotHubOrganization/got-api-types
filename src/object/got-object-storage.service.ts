import { Component, HttpStatus, HttpException } from '@nestjs/common';
import { Config } from '../config';
import { S3Utils } from '../common/utils/s3-utils';
import { GotObjectDto } from './dto/got-object.dto';
import { Map } from '../common/utils/map';
import { GotTypeDto } from '../type/dto/got-type.dto';
import { GotPropertyDto } from '../type/dto/got-property.dto';
import { GotPrimitiveTypes } from '../type/dto/enums/got-primitive-types.enum';

@Component()
export class GotObjectStorageService {

    /**
     * constructor
     * @constructor
     * @param {S3Utils} s3Utils
     */
    constructor(private s3Utils: S3Utils) {
    }

    /**
     * puts a Got Object Instance  to S3
     * Must return a promise to build a promise chain
     * @param {GotObjectDto} gotObject
     * @returns Promise<any>
     */
    public store(gotObject: GotObjectDto): Promise<any> {
        return this.s3Utils.putObjectToS3(gotObject.id, gotObject,
            { ServerSideEncryption: 'aws:kms' })
            .then((response) => {
                console.log('S3 storage response ' + JSON.stringify(response));
                return { id: gotObject.id };
            });
    }

    /**
     * Fetches the requested GotObject
     * @param {string} id
     * @returns Promise<Map<GotObjectDto>>
     */
    public get(id: string): Promise<GotObjectDto> {
        return this.s3Utils.getObjectFromS3(id)
            .then(result => {
                return JSON.parse(result);
            })
            .catch(err => {
                console.log(err);
                throw new HttpException(id + ' not found.', HttpStatus.NOT_FOUND);
            });
    }
}