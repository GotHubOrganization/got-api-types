import * as AWS from 'aws-sdk';
import { Get, Controller, Param, Put, Body, UseInterceptors } from '@nestjs/common';

@Controller('types')
export class ApplicationController {
    @Get()
    public getHealthCheck(): String {
        return 'OK';
    }
}
