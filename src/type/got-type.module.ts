import { Module } from '@nestjs/common';
import { GotTypeController } from './got-type.controller';
import { GotTypeService } from './got-type.service';
import { S3Utils } from '../common/utils/s3-utils';
import { Config } from '../config';
import * as AWS from 'aws-sdk';

const s3UtilsFactory = {
    provide: S3Utils,
    useFactory: () => {
        let s3: AWS.S3 = new AWS.S3();
        return new S3Utils(s3, Config.APP.TYPES_BUCKET_NAME);
    },
    inject:[]
};

@Module({
    imports: [],
    controllers: [GotTypeController],
    components: [
        GotTypeService, 
        s3UtilsFactory
    ],
})
export class GotTypeModule {}
