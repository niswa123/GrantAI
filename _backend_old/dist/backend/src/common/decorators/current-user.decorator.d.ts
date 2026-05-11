export interface JwtPayload {
    sub: string;
    email: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
