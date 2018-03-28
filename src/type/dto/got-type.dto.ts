import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { GotPropertyDto } from './got-property.dto';

export class GotTypeDto {

    @ApiModelProperty({ type: String })
    @IsNotEmpty()
    readonly name: string;

    @ApiModelProperty({ type: Object, isArray: true })
    readonly validators: any[];

    @ApiModelProperty({ type: GotPropertyDto })
    @ValidateNested()
    @Type(() => GotPropertyDto)
    readonly properties: GotPropertyDto[];

    /**
     * checks if an GotType is required or not
     * @param object
     * @returns boolean
     */
    public isRequired(): boolean {
        this.validators.forEach(element => {
            if (element.indexOf('required') > -1) {
                return true;
            }
        });
        return false;
    }

}
