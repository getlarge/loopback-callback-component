/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from '@loopback/rest';
import {RequestBodyObject, ResponsesObject} from '@loopback/openapi-v3';

export type Packet = {
  topic: string;
  payload: any;
};

export type CallbackObject = {
  // expression must be evaluated when response is received
  [expression: string]: {
    [method: string]: {
      operationId: string;
      description?: string;
      requestBody?: RequestBodyObject;
      parameters?: any;
      responses?: ResponsesObject;
    };
  };
};

export interface CallbackMetadata {
  name: string;
  expression: string;
  method: string;
  parent: {path: string; method: string};
  options?: Object;
}

export interface CheckCallbackFn {
  (request: Request, response: Response, options?: Object): Promise<
    CallbackObject | undefined
  >;
}

export interface ResolveCallbackFn {
  (callback: CallbackObject, result: any): Promise<Packet>;
}

export interface CallbackStrategy {
  checkCallback(
    request: Request,
    response: Response,
    options?: Object,
  ): Promise<CallbackObject | undefined>;
  resolveCallback(callback: CallbackObject, result: any): Promise<Packet>;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
