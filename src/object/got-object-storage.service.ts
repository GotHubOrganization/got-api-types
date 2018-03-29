import { Component, HttpStatus, HttpException } from '@nestjs/common';
import { Config } from '../config';
import { S3Utils } from '../common/utils/s3-utils';
import { GotObjectDto } from './dto/got-object.dto';
import { Map } from '../common/utils/map';
import { GotTypeService } from '../type/got-type.service';
import { GotTypeDto } from '../type/dto/got-type.dto';
import { GotPropertyDto } from '../type/dto/got-property.dto';
import { GotPrimitiveTypes } from '../type/dto/enums/got-primitive-types.enum';

@Component()
export class GotObjectStorageService {

    /**
     * constructor
     * @constructor
     * @param {S3Utils} s3Utils
     * @param {GotTypeService} gotTypeService
     */
    constructor(private s3Utils: S3Utils, private gotTypeService: GotTypeService) {
    }

    /**
     * puts a Got Object Instance  to S3
     * Must return a promise to build a promise chain
     * @param {GotObjectDto} gotObject
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

     /**
     * Validates the gotObject with the respective schemas
     * throws a Bad Request Error if validation fails
     * @param  {GotObjectDto} gotObject
     * @returns Promise<void>
     */
    private validate(gotObject: GotObjectDto): Promise<void> {
        return this.gotTypeService.get(gotObject.schemaName)
        .then(gotTypes => {
            // clone the object for validation. Has to be cloned because during the validation the object will be manipulated
            let gotValidationClone: GotObjectDto = JSON.parse(JSON.stringify(gotObject));
            // fetched all respective gotTypeDefinitions, do structure validation based on them
            return this.validateObject(gotValidationClone.data, gotTypes[gotObject.schemaName], gotTypes);
        })
    }

    /**
     * Validates the gotObject data structure based on the schema structure rules
     * throws a Bad Request Error if validation fails
     * @param  {any} gotData
     * @param  {GotTypeDto} gotType
     * @param  {Map<GotTypeDto>} gotTypes
     * @returns void
     */
    private validateObject(gotData: any, gotType: GotTypeDto, gotTypes: Map<GotTypeDto>): void {
        // validate GotType on object-level first
        this.validateGotType(gotType, gotData);
        // on GotProperties =>
        // iterate through gotType-Schema and check corresponding fields in objectsToCheck data
        for (let gotProperty of gotType.properties) {
            //if primitive type, do validation
            if (GotPrimitiveTypes.contains(gotProperty.type as string)) {
                this.validatePrimitiveProperty(gotType, gotProperty, gotData[gotType.name]);
            }
            // complex type, do recursive check
            else {
                let nestedObjectsToCheck: any = {};
                nestedObjectsToCheck[gotProperty.type as string] = gotData[gotType.name][gotProperty.type as string];
                this.validateObject(nestedObjectsToCheck, gotTypes[gotProperty.type as string], gotTypes);
            }
            // remove checked attribute from verification object
            if (gotData[gotType.name][gotProperty.name]) {
                delete gotData[gotType.name][gotProperty.name];
            }
        }
        // check if any properties have been provided that dont match the schema
        if (!this.isEmptyObject(gotData[gotType.name])) {
            throw new HttpException('Following property you provided does not match the ' 
            + gotType.name + ' schema definition: ' +  JSON.stringify(Object.keys(gotData[gotType.name])[0]),
            HttpStatus.BAD_REQUEST);   
        }
        if (gotData[gotType.name]) {
            delete gotData[gotType.name];
        }
        //check if any objects have been provided that dont match the schema
        if (!this.isEmptyObject(gotData)) {
            throw new HttpException('Following objects you provided do not match the schema definition: ' 
            +  JSON.stringify(gotData),
            HttpStatus.BAD_REQUEST);              
        }
    }

     /**
     * Validates gotData against a GotType
     * throws a Bad Request Error if validation fails
     * @param gotType
     * @param gotData
     * @returns void
     */
    private validateGotType(gotType: GotTypeDto, gotData: any): void {
        // first check if the GotType is required and not provided
        if (gotType.required && !gotData[gotType.name]) {
            throw new HttpException('Required object not found: ' + gotType.name ,
            HttpStatus.BAD_REQUEST);   
        }
        // if its provided, do further checks
        else if (gotData[gotType.name]) {
            // TODO: do further checks based on GotType validation definitions
        }       
    }

    /**
     * Validates a primitive property against a (sub)-gotData
     * throws a Bad Request Error if validation fails
     * @param  {GotPropertyDto} gotProperty
     * @param  {any} gotData
     * @returns void
     */
    private validatePrimitiveProperty(gotType: GotTypeDto, gotProperty: GotPropertyDto, gotData: any): void {
        if (gotProperty.required && !gotData[gotProperty.name]) {
            throw new HttpException('Required property not found: ' + gotType.name + '.' + gotProperty.name ,
            HttpStatus.BAD_REQUEST);               
        }
        // if field is provided, check provided validation rules
        else if (gotData[gotProperty.name]) {
            this.validateCustomPropertyRules(gotProperty, gotData);
        }
    }

    /**
     * Validates the gotProperty data based on the respective validation rules of the field
     * throws a Bad Request Error if validation fails
     * @param  {GotPropertyDto} gotProperty
     * @param  {any} gotData
     * @returns void
     */
    private validateCustomPropertyRules(gotProperty: GotPropertyDto, gotData: any): void {
        // TODO: implement
    }

    /**
     * @param  {any} obj
     * @returns boolean
     */
    private isEmptyObject(obj: any): boolean {
        for(var prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
          }
        }
        return true;
      }
}
