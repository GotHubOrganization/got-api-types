import { Component, HttpStatus, HttpException } from '@nestjs/common';
import { Config } from '../config';
import { GotObjectDto } from './dto/got-object.dto';
import { Map } from '../common/utils/map';
import { GotTypeService } from '../type/got-type.service';
import { GotTypeDto } from '../type/dto/got-type.dto';
import { GotPropertyDto } from '../type/dto/got-property.dto';
import { GotPrimitiveTypes } from '../type/dto/enums/got-primitive-types.enum';

@Component()
export class GotObjectValidationService {

    /**
     * constructor
     * @constructor
     * @param {GotTypeService} gotTypeService
     */
    constructor(private gotTypeService: GotTypeService) {
    }

     /**
     * Validates the gotObject with the respective schemas
     * throws a Bad Request Error if validation fails
     * @param  {GotObjectDto} gotObject
     * @returns Promise<void>
     */
    public validate(type: string, data: any): Promise<GotObjectDto> {
        let gotObject: GotObjectDto = new GotObjectDto();
        gotObject.type = type;
        gotObject.data = data;
        return this.gotTypeService.get(gotObject.type)
        .then(gotTypes => {
            // clone the object for validation. Has to be cloned because during the validation the object will be manipulated
            let gotValidationClone: GotObjectDto = JSON.parse(JSON.stringify(gotObject));
            // fetched all respective gotTypeDefinitions, do structure validation based on them
            return this.validateData(gotValidationClone.data, gotObject.type, gotTypes);
        })
        .then(() => {
            return gotObject;
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
    private validateData(gotData: any, gotTypeName: string, gotTypes: Map<GotTypeDto>): void {
        // check if gotType definition exists. If not, throw bad request error
        if (!gotTypes[gotTypeName]) {
            throw new HttpException('Provided type ' + gotTypeName + ' not found in type definition.' ,
            HttpStatus.BAD_REQUEST);   
        }
        let gotType: GotTypeDto = gotTypes[gotTypeName];
        // on GotProperties =>
        // iterate through gotType-Schema and check corresponding fields in objectsToCheck data
        for (let gotProperty of gotType.properties) {
            //if primitive type, do validation
            if (GotPrimitiveTypes.contains(gotProperty.type as string)) {
                this.validatePrimitiveProperty(gotType, gotProperty, gotData);
            }
            // complex type, do recursive check
            else {
                // check if required complex property was provided, if not throw error
                this.validateComplexProperty(gotProperty, gotData); 
                let nestedObjectToCheck: any = {};
                nestedObjectToCheck = gotData[gotProperty.name as string];
                this.validateData(nestedObjectToCheck, gotProperty.type as string, gotTypes);
            }
            // remove checked attribute from verification object
            if (gotData[gotProperty.name]) {
                delete gotData[gotProperty.name];
            }
        }
        // check if any properties have been provided that dont match the schema
        if (!this.isEmptyObject(gotData)) {
            if (gotData)
            throw new HttpException('Following property you provided does not match the ' 
            + gotType.name + ' schema definition: ' +  JSON.stringify(Object.keys(gotData)[0]),
            HttpStatus.BAD_REQUEST);   
        }
        if (gotData[gotType.name]) {
            delete gotData[gotType.name];
        }
    }

     /**
     * Validates gotData against a GotType
     * throws a Bad Request Error if validation fails
     * @param gotType
     * @param gotData
     * @returns void
     */
    private validateComplexProperty(gotProperty: GotPropertyDto, gotData: any): void {
        // first check if the GotType is required and not provided
        if (gotProperty.required && !gotData[gotProperty.name]) {
            throw new HttpException('Required object not found: ' + gotProperty.name ,
            HttpStatus.BAD_REQUEST);   
        }
        // if its provided, do further checks
        else if (gotData[gotProperty.name]) {
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
            if (prop === 'id') {
                return true;
            }  
            return false;
          }
        }
        return true;
      }
}
