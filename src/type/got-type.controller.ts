import * as AWS from 'aws-sdk';
import { Get, Controller, Param, Put, Body, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotTypeDto } from './dto/got-type.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { GotTypeService } from './got-type.service';
import { GotPropertyDto } from './dto/got-property.dto';

@Controller('type')
@UseInterceptors(TransformInterceptor)
export class GotTypeController {

    //helper variable for the already fetched object definitions, to not fetch them multiple times
    private extractedObjectTypes: any = {};
    private gotTypesFlattened: GotTypeDto[] = new Array(0); 

    constructor(private gotTypeService: GotTypeService) {
    }

    @Get('/:name')
    public getType(@Param() params: any): Promise<GotTypeDto> {
        return this.gotTypeService.get(params.name);
    }

    @Put('/')
    public putType(@Body() body: GotTypeDto[]): Promise<any[]> {
        for (let gotTypeObject of body) {
            this.extractObjects(gotTypeObject);
        }
        //clear object hash map after use
        this.extractedObjectTypes = {};
        return Promise.all(this.gotTypesFlattened.map(async (gotTypeFlattened) => {
            return this.gotTypeService.put(gotTypeFlattened);
        }))
        .then(results => {
            // clear gotTypesFlattened after use
            this.gotTypesFlattened = new Array(0);
            return results;
        });
    }

    /**
     * Receives GotType Object, which might have subobject-definitions in it 
     * and extracts those definitions. Then saves them in flattenedObjects-Array 
     * @param gotType
     */
    private extractObjects(gotType: GotTypeDto): void  {
        // only add when it hasnt been added before, to avoid duplicate definitions
        if (!this.extractedObjectTypes[gotType.name]) {
            this.gotTypesFlattened.push(gotType);
            this.extractedObjectTypes[gotType.name] = gotType;
            for (let property of gotType.properties) {
                if (property.type.hasOwnProperty('name')) {
                    if (property.type instanceof Object) {
                        let gotTypeParsed: GotTypeDto = property['type'] as GotTypeDto;
                        property.type = gotTypeParsed.name;
                        this.extractObjects(gotTypeParsed);
                    }
                }
            }       
        }
        else {
            if (JSON.stringify(this.extractedObjectTypes[gotType.name] !== JSON.stringify(gotType))) {
                throw new HttpException('Duplicate type definition with unequal properties found: '
                + gotType.name
                , HttpStatus.BAD_REQUEST);
            }
        }
    }
}

