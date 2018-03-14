import * as AWS from 'aws-sdk';
import { Get, Controller, Param, Put, Body, UseInterceptors } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotTypeDto } from './dto/got-type.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { GotTypeService } from './got-type.service';
import { GotTypeRequestDto } from './dto/got-type-request.dto';
import { GotPropertyDto } from './dto/got-property.dto';

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
    public putType(@Body() body: GotTypeDto[]): Promise<string[]> {
        return Promise.all(body.map(async (gotType) => {
            // console.log(gotType);
            this.extractObjects(gotType);
            return this.gotTypeService.put(gotType);
        }))
        .then(results => {
            return results;
        });
    }

    private extractObjects(gotType: GotTypeDto): GotTypeDto[]  {
        // console.log(gotType);
        for (let property of gotType.properties) {
            if (property.type.hasOwnProperty('name')) {
                
                console.log(typeof property.type);
            }
            // console.log(property.name);
        }
        return null;
    }
}

