import { param } from './methods/param';
import { security } from './methods/security';
import { security_lower_tf } from './methods/security_lower_tf';
declare const methods: {
    param: typeof param;
    security: typeof security;
    security_lower_tf: typeof security_lower_tf;
};
export declare class PineRequest {
    private context;
    private _cache;
    param: ReturnType<typeof methods.param>;
    security: ReturnType<typeof methods.security>;
    security_lower_tf: ReturnType<typeof methods.security_lower_tf>;
    constructor(context: any);
}
export default PineRequest;
