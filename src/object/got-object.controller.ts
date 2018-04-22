import { Get, Controller, Param, Body, UseInterceptors, HttpException, HttpStatus, UsePipes, ValidationPipe, Post } from '@nestjs/common';
import { GotObjectDto } from './dto/got-object.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { ApiResponse } from '@nestjs/swagger';
import { GotObjectStorageService } from './got-object-storage.service';
import { GotObjectValidationService } from './got-object-validation.service';

@Controller('types/object') // Infrastructure must be changed to have a clean route.
@UseInterceptors(TransformInterceptor)
export class GotObjectController {

    /**
     * @param  {GotObjectValidationService} privategotObjectValidationService
     * @returns GotObjectValidationService
     */
    constructor(private gotObjectValidationService: GotObjectValidationService,
        private gotObjectStorageService: GotObjectStorageService) {
    }

    /**
     * @param  {} @Param(
     * @param  {any} params
     * @returns Promise
     */
    @ApiResponse({ status: 200, description: 'The record has been found.' })
    @ApiResponse({ status: 404, description: 'The record has not been found.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @Get('/:id')
    public getObject(@Param() params: any): Promise<GotObjectDto> {
        return this.gotObjectStorageService.get(params.id);
    }

    /**
     * @param  {} @Param(
     * @param  {any} params
     * @param  {} @Body(
     * @param  {any} body
     * @returns Promise
     */
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @Post('/:type/:id?')
    public storeObject(@Param() params: any,
        @Body() body: any): Promise<any> {
        return this.gotObjectValidationService.validate(params.type, body)
            .then((gotObject) => {
                return this.gotObjectStorageService.store(gotObject, params.id);
            });
    }
}

