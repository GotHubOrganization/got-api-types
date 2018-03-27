import { Module, NestModule, MiddlewaresConsumer } from '@nestjs/common';
import { GotTypeModule } from './type/got-type.module';
import { ApplicationController } from './app.controller';
import { GotObjectModule } from './object/got-object.module';

@Module({
    imports: [
        GotTypeModule,
        GotObjectModule
    ],
    controllers: [ApplicationController]
})
export class ApplicationModule {
}
