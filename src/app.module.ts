import { Module, NestModule, MiddlewaresConsumer, RequestMethod } from '@nestjs/common';
import { GotTypeModule } from './type/got-type.module';
import { ApplicationController } from './app.controller';
import { GotObjectModule } from './object/got-object.module';
import { CorsMiddleware } from './common/middlewares/cors.middleware';

@Module({
    imports: [
        GotTypeModule,
        GotObjectModule
    ],
    controllers: [ApplicationController]
})
export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(CorsMiddleware).forRoutes(
            { path: '*', method: RequestMethod.ALL },
        );
    }
}
