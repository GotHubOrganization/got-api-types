import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { GotPropertyDto } from './got-property.dto';

export class GotTypeDto {

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    readonly name: string;

    @ApiModelProperty({ type: GotPropertyDto })
    @ValidateNested()
    @Type(() => GotPropertyDto)
    readonly properties: GotPropertyDto[];
}
