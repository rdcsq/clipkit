export type ApiResult<T = undefined> = {
    success: true;
    data: T;
} | {
    success: false;
    data?: undefined | null;
    errorMessage: string;
    bodyErrors?: Record<string, any>
}

export type PApiResult<T> = Promise<ApiResult<T>>
