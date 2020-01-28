/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from '@loopback/rest';
import {
  ParameterObject,
  RequestBodyObject,
  ResponsesObject,
} from '@loopback/openapi-v3';

export type Packet = {
  topic: string;
  payload: any;
};

// for now consider CallbackObject as CallbacksObject to reduce complexity
export type CallbackObject = {
  // expression must be evaluated when response is received
  name: string;
  expression: string;
  method: string;
  parent: {path: string; method: string};
  requestBody?: RequestBodyObject;
  responses?: ResponsesObject;
  parameters?: ParameterObject;
};

export interface CallbackMetadata extends CallbackObject {
  options?: Object;
}

export interface CheckCallbackFn {
  (request: Request, response: Response, options?: Object): Promise<
    CallbackObject | undefined
  >;
}

export interface SetCallbackFn {
  (callback: CallbackObject, request: Request, result: any): Promise<
    Packet | undefined
  >;
}

export interface CallbackStrategy {
  checkCallback(
    request: Request,
    response: Response,
    options?: Object,
  ): Promise<CallbackObject | undefined>;
  setCallback(
    callback: CallbackObject,
    request: Request,
    result: any,
  ): Promise<Packet | undefined>;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
