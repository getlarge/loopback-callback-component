import {
  MethodDecoratorFactory,
  Constructor,
  MetadataInspector,
} from '@loopback/core';
import {
  ParameterObject,
  RequestBodyObject,
  ResponsesObject,
} from '@loopback/openapi-v3';
import {CALLBACK_METADATA_KEY} from '../keys';
import {CallbackMetadata} from '../types';

export function callback(
  name: string,
  expression: string,
  method: string,
  parent: {path: string; method: string},
  requestBody?: RequestBodyObject,
  responses?: ResponsesObject,
  parameters?: ParameterObject,
  options?: Object,
) {
  return MethodDecoratorFactory.createDecorator<CallbackMetadata>(
    CALLBACK_METADATA_KEY,
    {
      name,
      expression,
      method,
      parent,
      requestBody,
      responses,
      parameters,
      options: options ?? {},
    },
  );
}

export function getCallbackMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): CallbackMetadata | undefined {
  return MetadataInspector.getMethodMetadata<CallbackMetadata>(
    CALLBACK_METADATA_KEY,
    controllerClass.prototype,
    methodName,
  );
}
