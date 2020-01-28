import {
  MethodDecoratorFactory,
  Constructor,
  MetadataInspector,
} from '@loopback/core';
import {CALLBACK_METADATA_KEY} from '../keys';
import {CallbackMetadata} from '../types';

export function callback(
  name: string,
  expression: string,
  method: string,
  parent: {path: string; method: string},
  options?: Object,
) {
  return MethodDecoratorFactory.createDecorator<CallbackMetadata>(
    CALLBACK_METADATA_KEY,
    {
      name,
      expression,
      method,
      parent,
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
