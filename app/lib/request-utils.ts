import { ZodError } from "zod";
import type { ApiResult } from "./api-result";

export function transformZodError(zodError: ZodError) {
  const formErrors: Record<string, string> = {};
  for (const error of zodError.errors) {
    formErrors[error.path[0]] = error.message;
  }
  return formErrors;
}

export async function parseBody<T>(
  request: Request,
  parse: (obj: Record<string, any>) => T,
  optionalHeaders?: [string, string][]
): Promise<T> {
  let body: Record<string, any> = {}

  switch (request.headers.get("Content-Type")) {
    case "application/json": {
      body = await request.json();
      break;
    }
    case "application/x-www-form-urlencoded":
    case "application/x-www-form-urlencoded;charset=UTF-8": {
      const formData = await request.formData();
      formData.forEach((value, key) => (body[key] = value.toString()));
      break;
    }
    default: {
      throw new Response(null, { status: 415, headers: optionalHeaders });
    }
  }

  try {
    return parse(body);
  } catch (e) {
    if (e instanceof ZodError) {
      const errors = transformZodError(e);
      throw Response.json(
        {
          success: false,
          bodyErrors: errors,
          errorMessage: "Please verify the fields you've provided."
        } satisfies ApiResult<undefined>,
        { status: 400, headers: optionalHeaders }
      );
    }
    throw e;
  }
}
