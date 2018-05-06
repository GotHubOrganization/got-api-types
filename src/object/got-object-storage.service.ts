import { Component, HttpStatus, HttpException } from '@nestjs/common';
import { Config } from '../config';
import { S3Utils } from '../common/utils/s3-utils';
import { GotObjectDto } from './dto/got-object.dto';
import { Map } from '../common/utils/map';
import uuid = require('uuid-v4');
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
     * puts a Got Object Instance  to S3. If no id is given a new id will be
     * created. Calling this method without id would mean to create a new object whereas
     * calling it with id would mean to update an existing object.
     * Must return a promise to build a promise chain
     * @param {GotObjectDto} gotObject
     * @param {String} id 
     * @returns Promise<any>
     */
    public store(gotObject: GotObjectDto, id?: string): Promise<any> {
        gotObject.data.id = id ? id : this.getNewObjectId();
        gotObject.timestamp = new Date();
        return this.s3Utils.putObjectToS3(gotObject.data.id, gotObject,
            { ServerSideEncryption: 'aws:kms' })
            .then((response) => {
                console.log('S3 storage response ' + JSON.stringify(response));
                return { id: gotObject.data.id };
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
                return JSON.parse(result).data;
            })
            .catch(err => {
                console.log(err);
                throw new HttpException(id + ' not found.', HttpStatus.NOT_FOUND);
            });
    }

    /**
     * Generates a new UUIDv4
     * @returns string
     */
    private getNewObjectId(): string {
        return uuid();
    }
}
