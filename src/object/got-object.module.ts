import { Module } from '@nestjs/common';
import { GotObjectController } from './got-object.controller';
import { GotObjectService } from './got-object.service';
import { S3Utils } from '../common/utils/s3-utils';
import { Config } from '../config';
import * as AWS from 'aws-sdk';
import { GotTypeModule } from '../type/got-type.module';

const s3UtilsFactory = {
    provide: S3Utils,
    useFactory: () => {
        let s3: AWS.S3 = new AWS.S3();
        return new S3Utils(s3, Config.APP.OBJECTS_BUCKET_NAME);
    },
    inject:[]
};

@Module({
    imports: [GotTypeModule],
    controllers: [GotObjectController],
    components: [
        GotObjectService, 
        s3UtilsFactory
    ],
})
export class GotObjectModule {}
