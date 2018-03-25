import { Component, HttpStatus } from '@nestjs/common';
import { Config } from '../config';
import { HttpException } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotObjectDto } from './dto/got-object.dto';
import { Map } from '../common/utils/map';

@Component()
export class GotObjectService {

    /**
     * constructor
     */
    constructor(private s3Utils: S3Utils) {
    }

    /**
     * puts a Got Object Instance  to S3
     * Must return a promise to build a promise chain
     * @param gotObject
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
     * @param id
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
