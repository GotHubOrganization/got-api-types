import { Component, HttpStatus } from '@nestjs/common';
import { Config } from '../config';
import { HttpException } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotObjectDto } from './dto/got-object.dto';
import { Map } from '../common/utils/map';
import { GotTypeService } from '../type/got-type.service';
import { GotTypeDto } from '../type/dto/got-type.dto';
import { GotPropertyDto } from '../type/dto/got-property.dto';

@Component()
export class GotObjectService {

    /**
     * constructor
     */
    constructor(private s3Utils: S3Utils, private gotTypeService: GotTypeService) {
    }

    /**
     * puts a Got Object Instance  to S3
     * Must return a promise to build a promise chain
     * @param gotObject
     * @returns Promise<any>
     */
    public store(gotObject: GotObjectDto): Promise<any> {
        return this.validate(gotObject)
        .then(() => {
            return this.s3Utils.putObjectToS3(gotObject.id, gotObject,
                { ServerSideEncryption: 'aws:kms' })
                .then((response) => {
                    console.log('S3 storage response ' + JSON.stringify(response));
                    return { id: gotObject.id };
                });          
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

     /**
     * Validates the gotObject with the respective schemas
     * throws a Bad Request Error if validation fails
     * @param gotObject
     * @returns Promise<void>
     */
    private validate(gotObject: GotObjectDto): Promise<void> {
        return this.gotTypeService.get(gotObject.schemaName)
        .then(gotTypes => {
            // fetched all respective gotTypeDefinitions, do structure validation based on them
            this.validateStructure(gotObject, gotTypes);
            let errors: any[] = new Array(0);
            //TODO implement validation and fill error array with errors
            if (errors.length > 0) {
                throw new HttpException('Schema Validation failed: ' + errors[0] ,
                    HttpStatus.BAD_REQUEST);
            }
            return null;           
        })
    }

    /**
     * Validates the gotObject data structure based on the schema structure rules
     * throws a Bad Request Error if validation fails
     * @param gotObject
     * @returns Promise<void>
     */
    private validateStructure(gotObject: GotObjectDto, gotTypes: Map<GotTypeDto>): void {
        console.log('LOG');
        let gotType: GotTypeDto = gotTypes[gotObject.schemaName];
        if (!gotType) {
            throw new HttpException('Schema not found: ' + gotObject.schemaName ,
                HttpStatus.BAD_REQUEST);
        }
        // iterate through gotType-Schema and check corresponding fields in gotObject data
        for (let gotTypeProperty of gotType.properties) {
            //if complex type then do recursive check
            if (gotTypeProperty instanceof Object) {
                this.validateStructure()
            }
            // primitive type, check if field was submitted in data (when field was required)
            // keep in mind: what about fields that have been submitted in data but are NOT in the schema structure
            gotType
        }




        // iterate through object data and compare to given structure based on type definition
        for (const key of Object.keys(gotObject.data)) {
            if (!gotType.properties[key]) {
                throw new HttpException('Property not found: ' + key ,
                HttpStatus.BAD_REQUEST);               
            }
            console.log(key, gotObject.data[key]);
        }
        return null;
    }

    /**
     * Validates the gotProperty data based on the respective validation rules of the field
     * throws a Bad Request Error if validation fails
     * @param gotObject
     * @returns Promise<void>
     */
    private validatePropertyRules(gotProperty: GotPropertyDto): Promise<void> {
        return null;
    }


}
