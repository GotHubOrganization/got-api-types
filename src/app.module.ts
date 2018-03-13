import { Module, NestModule, MiddlewaresConsumer } from '@nestjs/common';
import { GotTypeModule } from './type/got-type.module';
import { GotTypeController } from './type/got-type.controller';
import { ApplicationController } from './app.controller';

@Module({
    imports: [GotTypeModule],
    controllers: [ApplicationController]
})
export class ApplicationModule {
}
