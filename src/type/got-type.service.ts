import { Component, HttpStatus } from '@nestjs/common';
import { Config } from '../config';
import { HttpException } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotTypeDto } from './dto/got-type.dto';
import { GotPropertyDto } from './dto/got-property.dto';
import { GotPrimitiveTypes } from './dto/enums/got-primitive-types.enum';
import { Map } from '../common/utils/map';

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
     * Fetches the requested GotTypeObject first and then fetches all the referenced objects if necessary
     * returns everything as a GotTypeObject array
     * @param gotTypeName
     * @returns Promise<Map<GotTypeDto>>
     */
    public get(gotTypeName: string): Promise<Map<GotTypeDto>> {
        return this.fetchGotTypeObject(gotTypeName);
    }

    /**
     * returns a got type object to the corresponding key from the S3 cache
     * Must return a promise to build a promise chain
     * @param gotTypeName
     * @returns Promise<GotTypeDto>
     */
    private async fetchGotTypeObject(gotTypeName: string, fetchedTypes: Map<GotTypeDto> = {}): Promise<Map<GotTypeDto>> {
        return this.s3Utils.getObjectFromS3(gotTypeName)
            .then(result => {
                let gotTypeObject: GotTypeDto = JSON.parse(result);
                fetchedTypes[gotTypeObject.name] = gotTypeObject;
                return this.fetchPropertyTypes(gotTypeObject, fetchedTypes).then(() => {
                    return fetchedTypes;
                });
            })
            .catch(err => {
                console.log(err);
                throw new HttpException(gotTypeName + ' not found.', HttpStatus.NOT_FOUND);
            });
    }

    /**
     * checks gotTypeObject properties for complex types and fetches them if necessary
     * @param gotTypeObject
     * @returns Promise<void>
     */
    private async fetchPropertyTypes(gotTypeObject: GotTypeDto, fetchedTypes: Map<GotTypeDto> = {}): Promise<void> {
        let fetchPropertyTypePromises: Promise<any>[] = [];

        gotTypeObject.properties.filter((property) => {
            return GotPrimitiveTypes.contains(property.type as string) &&
                !fetchedTypes[property.type as string];
        }).forEach((property) => {
            fetchPropertyTypePromises.push(this.fetchGotTypeObject(property.type as string, fetchedTypes));
        });

        await Promise.all(fetchPropertyTypePromises);
    }
}
