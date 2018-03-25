import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, ValidateNested, IsEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GotObjectDto {

    @IsEmpty()
    id: string;

    @IsEmpty()
    timestamp: Date;

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    readonly schemaName: string;

    @ApiModelProperty({ type: Object })
    @Type(() => Object)
    readonly object: any;

}
