import { Get, Controller, Param, Put, Body, UseInterceptors, HttpException, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { GotTypeDto } from './dto/got-type.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { GotTypeService } from './got-type.service';
import { GotPropertyDto } from './dto/got-property.dto';
import { Map } from '../common/utils/map';
import { GotTypePipe } from './pipes/got-type.pipe';

@Controller('types/type')
@UseInterceptors(TransformInterceptor)
export class GotTypeController {

    constructor(private gotTypeService: GotTypeService) {
    }

    @Get('/:name')
    public getType(@Param() params: any): Promise<Map<GotTypeDto>> {
        console.log(params.name);
        return this.gotTypeService.get(params.name);
    }

    @Put('/')
    @UsePipes(new GotTypePipe())
    public putType(@Body() body: Map<GotTypeDto>): Promise<any[]> {
        let putPromises: Promise<any>[] = Object.keys(body).map(key => {
            return this.gotTypeService.put(body[key]);
        });
        return Promise.all(putPromises);
    }
}

