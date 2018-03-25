/**
 * Configuration
 */
export class Config {
    public static get APP(): any {
        return {
            SERVICE_PORT: process.env['SERVICE_PORT'] || 8080,
            TYPES_BUCKET_NAME: process.env['TYPES_BUCKET_NAME'] || 'gothub-types-dev',
            OBJECTS_BUCKET_NAME: process.env['OBJECTS_BUCKET_NAME'] || 'gothub-objects-dev',
            AWS_REGION: process.env['AWS_REGION'] || 'us-east-1',
            AWS_SIGNATURE_VERSION: process.env['AWS_SIGNATURE_VERSION'] || 'v4',
            SWAGGER_TITLE: process.env['SWAGGER_TITLE'] || 'Got Types API',
            SWAGGER_DESCRIPTION: process.env['SWAGGER_DESCRIPTION'] || 'Creating and fetching Type Definitions from the Got-Platform',
            SWAGGER_VERSION: process.env['SWAGGER_VERSION'] || 'TBD',
            SWAGGER_TAG: process.env['SWAGGER_TAG'] || 'TBD',
        };
    }
}
