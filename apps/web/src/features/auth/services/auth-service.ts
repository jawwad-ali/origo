import { type CurrentUserDto, type LoginInput, type SignupInput } from "@origo/shared";
import { postJson } from "@/lib/api/client-api";
import { API_ROUTES } from "@/lib/api/constants";

export const login = (input: LoginInput): Promise<CurrentUserDto> => postJson(API_ROUTES.login, input);

export const signup = (input: SignupInput): Promise<CurrentUserDto> => postJson(API_ROUTES.signup, input);

export const logout = (): Promise<void> => postJson(API_ROUTES.logout);
