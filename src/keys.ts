import {BindingKey, CoreBindings, MetadataAccessor} from '@loopback/core';
import {
  CheckCallbackFn,
  SetCallbackFn,
  CallbackStrategy,
  CallbackMetadata,
} from './types';

export namespace CallbackBindings {
  export const CALLBACK_STRATEGY = BindingKey.create<
    CallbackStrategy | undefined
  >('callback.strategy');

  export const CALLBACK_CHECK = BindingKey.create<CheckCallbackFn | undefined>(
    'callback.check',
  );

  export const CALLBACK_SET = BindingKey.create<SetCallbackFn | undefined>(
    'callback.set',
  );

  export const METADATA = BindingKey.create<CallbackMetadata | undefined>(
    'callback.operationMetadata',
  );
}

export const CALLBACK_METADATA_KEY = MetadataAccessor.create<
  CallbackMetadata,
  MethodDecorator
>('callback.operationsData');
