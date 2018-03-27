
import {
    PipeTransform,
    Pipe,
    ArgumentMetadata,
    HttpStatus, HttpException,
} from '@nestjs/common';
import { GotTypeDto } from '../../type/dto/got-type.dto';
import { GotTypeService } from '../../type/got-type.service';
import { Map } from '../../common/utils/map';

/**
 * Pipe implementation that is called to validate got-objects based on their respective schemas
 */
@Pipe()
export class GotSchemaValidationPipe implements PipeTransform<any> {

    constructor(private gotTypeService: GotTypeService) {
    }

    async transform(value, metadata: ArgumentMetadata) {
        console.log('enterin schema validation pipe');
        let errors: any[] = new Array(0);
        //TODO implement validation and fill error array with errors
        if (errors.length > 0) {
            throw new HttpException('Schema Validation failed: ' + errors[0] ,
                HttpStatus.BAD_REQUEST);
        }
        return value;
    }

    private fetchTypeSchemas(schemaName: string): Promise<Map<GotTypeDto>> {
        return this.gotTypeService.get(schemaName);
    }
}
