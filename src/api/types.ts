export type ApiResult<T> = {
  resultType: string;
  httpStatusCode: number;
  message: string;
  data: T;
};

export function unwrapApiResult<T>(res: ApiResult<T> | T): T {
  if (
    res &&
    typeof res === 'object' &&
    'resultType' in res &&
    'httpStatusCode' in res &&
    'message' in res &&
    'data' in res
  ) {
    return (res as ApiResult<T>).data;
  }
  return res as T;
}
