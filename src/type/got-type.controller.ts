import * as AWS from 'aws-sdk';
import { Get, Controller, Param, Put, Body, UseInterceptors } from '@nestjs/common';
import { S3Utils } from '../common/utils/s3-utils';
import { GotTypeDto } from './dto/got-type.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { GotTypeService } from './got-type.service';

@Controller('types/type')
@UseInterceptors(TransformInterceptor)
export class GotTypeController {

    constructor(private gotTypeService: GotTypeService) {
    }

    @Get('/:name')
    public getType(@Param() params: any): Promise<GotTypeDto> {
        return this.gotTypeService.get(params.name);
    }

    @Put('/')
    public putType(@Body() body: GotTypeDto): Promise<string> {
        return this.gotTypeService.put(body);
    }
}
