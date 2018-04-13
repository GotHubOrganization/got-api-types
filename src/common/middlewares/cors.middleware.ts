import { Middleware, NestMiddleware, ExpressMiddleware } from '@nestjs/common';
import * as cors from 'cors';

@Middleware()
export class CorsMiddleware implements NestMiddleware {
    resolve(...args: any[]): ExpressMiddleware {
        return (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        };
    }
}
