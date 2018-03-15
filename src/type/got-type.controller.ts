import * as AWS from 'aws-sdk';
import { Get, Controller, Param, Put, Body, UseInterceptors } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotTypeDto } from './dto/got-type.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { GotTypeService } from './got-type.service';
import { GotTypeRequestDto } from './dto/got-type-request.dto';
import { GotPropertyDto } from './dto/got-property.dto';
const util = require('util')

@Controller('type')
@UseInterceptors(TransformInterceptor)
export class GotTypeController {

    constructor(private gotTypeService: GotTypeService) {
    }

    @Get('/:name')
    public getType(@Param() params: any): Promise<GotTypeDto> {
        return this.gotTypeService.get(params.name);
    }

    @Put('/')
    public putType(@Body() body: GotTypeDto[]): Promise<any[]> {
        let gotTypesFlattened: GotTypeDto[] = new Array();
        for (let gotTypeObject of body) {
            gotTypesFlattened.push.apply(gotTypesFlattened, this.extractObjects(gotTypeObject));
        }
        return Promise.all(gotTypesFlattened.map(async (gotTypeFlattened) => {
            return this.gotTypeService.put(gotTypeFlattened);
        }))
        .then(results => {
            return results;
        });
    }

    /**
     * Receives GotType Object, which might have subobject-definitions in it 
     * and extracts those definitions. Then returns an GotType Array
     * with only flat objects 
     * @param gotType
     */
    private extractObjects(gotType: GotTypeDto): GotTypeDto[]  {
        let resultArr: any[] = new Array();
        for (let property of gotType.properties) {
            if (property.type.hasOwnProperty('name')) {
                if (property.type instanceof Object) {
                    let gotTypeParsed: GotTypeDto = property['type'] as GotTypeDto;
                    property.type = gotTypeParsed.name;
                    return this.extractObjects(gotTypeParsed).concat(gotType);
                }
            }
        }
        resultArr.push(gotType);
        return resultArr;
    }
}

