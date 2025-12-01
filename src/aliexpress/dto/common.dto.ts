export type AliCommonResponseDTO<K extends string, T> = {
  [key in K]: {
    result: T;
    rsp_code: number;
    rsp_msg: string;
    request_id: string;
    _trace_id_: string;
  };
};

export interface AliErrorResponseDTO {
  error_response: {
    type: string;
    code: string;
    msg: string;
    request_id: string;
    _trace_id_: string;
  };
}
