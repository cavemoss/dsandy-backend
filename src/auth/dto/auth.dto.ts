export interface LoginDTO {
  email: string;
  password: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
}

export enum AuthErrorEnum {
  INVALID = 1,
  NOT_FOUND,
  DUPLICATE,
}

export interface AuthErrorResponseDTO {
  errors: {
    email?: AuthErrorEnum;
    password?: AuthErrorEnum;
  };
}

export type LoginResponseDTO = { accessToken: string } | AuthErrorResponseDTO;
