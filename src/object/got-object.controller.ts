import { Get, Controller, Param, Body, UseInterceptors, HttpException, HttpStatus, UsePipes, ValidationPipe, Post } from '@nestjs/common';
import { GotObjectDto } from './dto/got-object.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import uuid = require('uuid-v4');
import { ApiResponse } from '@nestjs/swagger';
import { GotSchemaValidationPipe } from './pipes/got-schema-validation.pipe';
import { GotObjectStorageService } from './got-object-storage.service';
import { GotObjectValidationService } from './got-object-validation.service';

@Controller('objects/object')
@UseInterceptors(TransformInterceptor)
export class GotObjectController {
    
    /**
     * @param  {GotObjectValidationService} privategotObjectValidationService
     * @returns GotObjectValidationService
     */
    constructor(private gotObjectValidationService: GotObjectValidationService, 
        private gotObjectStorageService: GotObjectStorageService) {
    }

    @ApiResponse({ status: 200, description: 'The record has been found.' })
    @ApiResponse({ status: 404, description: 'The record has not been found.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @Get('/:id')
    public getObject(@Param() params: any): Promise<GotObjectDto> {
        return this.gotObjectStorageService.get(params.id);
    }

    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @Post('/')
    public storeObject(@Body() gotObject: GotObjectDto): Promise<any> {
        gotObject.id = this.getNewObjectId();
        gotObject.timestamp = new Date();
        return this.gotObjectValidationService.validate(gotObject)
        .then(() => {
            return this.gotObjectStorageService.store(gotObject);
        });
    }

    /**
     * Generates a new UUIDv4
     * @returns string
     */
    private getNewObjectId(): string {
        return uuid();
    }
}

