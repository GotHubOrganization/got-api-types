import { Interceptor, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

/**
 * Interceptor-Implementation that connects to method/function calls
 * and transforms JSON & Class & interface objects
 */
@Interceptor()
export class TransformInterceptor implements NestInterceptor {
    intercept(
        dataOrRequest,
        context: ExecutionContext,
        stream$: Observable<any>,
    ): Observable<any> {
        return stream$.map(data => ( data ));
    }
}
