import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, ValidateNested, IsEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ObjectData } from './interfaces/object-data.interface';

export class GotObjectDto {

    @IsEmpty()
    timestamp: Date;

    @ApiModelProperty({ type: String })
    @IsEmpty()
    type: string;

    @ApiModelProperty({ type: Object })
    @Type(() => Object)
    data: ObjectData;

}
