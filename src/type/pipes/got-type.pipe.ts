
import {
    PipeTransform,
    Pipe,
    ArgumentMetadata,
    HttpStatus, HttpException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GotTypeDto } from '../dto/got-type.dto';
import { Map } from '../../common/utils/map';

/**
 * Pipe implementation that is called to validate objects based on the class-validator decorators
 */
@Pipe()
export class GotTypePipe implements PipeTransform<any> {

    async transform(plainGotTypes: any[], metadata: ArgumentMetadata) {
        let result: Map<GotTypeDto> = {};
        for (const plainGotType of plainGotTypes) {
            this.extractTypes(plainGotType, result);
        }
        return result;
    }

    /**
     * Receives GotType Object, which might have subobject-definitions in it 
     * and extracts those definitions. Then saves them in flattenedObjects-Array 
     * @param plainGotType
     */
    private extractTypes(plainGotType: any, flatGotTypes: Map<GotTypeDto> = {}): void {
        for (let property of plainGotType.properties) {
            if (property.type instanceof Object && property.type.hasOwnProperty('name')) {
                this.extractTypes(property.type, flatGotTypes);
                property.type = property.type.name;
            }
        }

        if (!flatGotTypes[plainGotType.name]) {
            flatGotTypes[plainGotType.name] = plainToClass(GotTypeDto, plainGotType as GotTypeDto);
        } else if (JSON.stringify(flatGotTypes[plainGotType.name]) !== JSON.stringify(plainGotType)) {
            throw new HttpException('Duplicate type definition with unequal properties found: '
                + plainGotType.name
                , HttpStatus.BAD_REQUEST);
        }
    }
}
