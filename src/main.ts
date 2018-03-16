import * as AWS from 'aws-sdk';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { Config } from './config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {

    AWS.config.region = Config.APP.AWS_REGION;
    AWS.config.signatureVersion = Config.APP.AWS_SIGNATURE_VERSION;
    // console.log(AWS.config.credentials.constructor);

    const app = await NestFactory.create(ApplicationModule);

    // Define Swagger metadata
    const options = new DocumentBuilder()
        .setTitle(Config.APP.SWAGGER_TITLE)
        .setDescription(Config.APP.SWAGGER_DESCRIPTION)
        .setVersion(Config.APP.SWAGGER_VERSION)
        .addTag(Config.APP.SWAGGER_TAG)
        .build();
    const document = SwaggerModule.createDocument(app, options);
    // swagger can be accessed on the server on the '/api' path
    SwaggerModule.setup('/api', app, document);
    
    app.useGlobalPipes(new ValidationPipe());
    
    // Start Node application on defined port
    await app.listen(Config.APP.SERVICE_PORT);
}
bootstrap();
