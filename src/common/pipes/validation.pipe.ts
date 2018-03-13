
import {
    PipeTransform,
    Pipe,
    ArgumentMetadata,
    HttpStatus, HttpException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Pipe implementation that is called to validate objects based on the class-validator decorators
 */
@Pipe()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value, metadata: ArgumentMetadata) {
        const { metatype } = metadata;
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToClass(metatype, value);
        console.log(value);
        const errors = await validate(object);
        if (errors.length > 0) {
            throw new HttpException('Validation failed: ' + errors[0].property ,
                HttpStatus.BAD_REQUEST);
        }
        return value;
    }

    private toValidate(metatype): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.find(type => metatype === type);
    }
}
