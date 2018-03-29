import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, ValidateNested, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { GotPropertyAccess } from './enums/got-property-access.enum';
import { GotTypeDto } from './got-type.dto';
export class GotPropertyDto {

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    readonly name: string;

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    type: string;

    @ApiModelProperty({ type: String })
    readonly view?: string;

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    @IsEnum(GotPropertyAccess)
    readonly access: GotPropertyAccess;

    @ApiModelProperty({ type: Object, isArray: true })
    readonly validators: any[];

    @ApiModelProperty({ type: Boolean })
    readonly required: boolean;

}

