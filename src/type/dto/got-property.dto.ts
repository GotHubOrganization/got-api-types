import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, ValidateNested, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { GotPropertyAccess } from './enums/got-property-access.enum';
export class GotPropertyDto {

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    readonly name: string;

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    readonly type: string;

    @ApiModelProperty({ type: String })
    readonly view?: string;

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    @IsEnum(GotPropertyAccess)
    readonly access: GotPropertyAccess;

}

