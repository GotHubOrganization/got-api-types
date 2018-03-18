import { Component, HttpStatus } from '@nestjs/common';
import { Config } from '../config';
import { HttpException } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotTypeDto } from './dto/got-type.dto';
import { GotPropertyDto } from './dto/got-property.dto';
const util = require('util')

@Component()
export class GotTypeService {

    //helper variable for the already fetched object definitions, to not fetch them multiple times
    private fetchedObjectNames: any = {}; 

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
        // console.log('get' + gotTypeName);
        return this.s3Utils.getObjectFromS3(gotTypeName)
            .then(result => {
                // save retrieved definition in hash map 
                this.fetchedObjectNames[gotTypeName] = gotTypeName;
                return this.fetchComplexTypes(JSON.parse('' + result));
            })
            .then(result => {
                console.log(util.inspect(result, false, null))
                return null;
            })
            .catch(err => {
                throw new HttpException('Entry not found.',
                    HttpStatus.NOT_FOUND);
            });
    }

    /**
     * returns a type object to the corresponding key from the S3 cache
     * Must return a promise to build a promise chain
     * @param gotTypeName
     */
    public getSingleObject(gotTypeName: string): Promise<GotTypeDto> {
        return this.s3Utils.getObjectFromS3(gotTypeName)
            .then(result => {
                // save retrieved definition in hash map 
                this.fetchedObjectNames[gotTypeName] = gotTypeName;
                return (JSON.parse('' + result));
            })
            .catch(err => {
                throw new HttpException('Entry not found.',
                    HttpStatus.NOT_FOUND);
            });
    }

    private fetchComplexTypes(gotType: GotTypeDto): Promise<any[]> {
        let resultArr: any[] = new Array();

        return Promise.all(gotType.properties.map(async (property) => {
            return this.fetchComplexTypesOfProperty(property)
                .then(result => {
                    if (!result) {
                        return Promise.resolve(null);
                    }
                    else {
                        return Promise.resolve(resultArr.push.apply(resultArr,this.fetchComplexTypes(result)));
                    }
                })
        }))
        .then(result => {
            console.log(result);
            console.log(resultArr);
            return Promise.resolve(resultArr);
        })
    }

    private fetchComplexTypesOfProperty(property: GotPropertyDto): Promise<GotTypeDto> {
        // check if property type is an object reference
        // and not a primitive type
        if (typeof property.type === 'string'
                && property.type !== 'string'
                && property.type !== 'boolean'
                && property.type !== 'number') {
            // found complex type
            // check if type was already fetched
            if (this.fetchedObjectNames[property.name as string]) {
                console.log('already fetched');
                return Promise.resolve(null);
            }
            else {
                return this.getSingleObject(property.name as string);
            }
        }
        else {
            return null;
        }        
    }

}
