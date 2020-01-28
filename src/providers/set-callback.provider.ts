/* eslint-disable @typescript-eslint/no-explicit-any */
import {inject, Provider, Getter} from '@loopback/core';
import {Request} from '@loopback/rest';
import {
  CallbackObject,
  Packet,
  SetCallbackFn,
  CallbackStrategy,
} from '../types';
import {CallbackBindings} from '../keys';

export class SetCallbackFnProvider implements Provider<SetCallbackFn> {
  constructor(
    @inject.getter(CallbackBindings.CALLBACK_STRATEGY)
    readonly getStoreStrategy: Getter<CallbackStrategy>,
  ) {}

  value(): SetCallbackFn {
    return (callback, request, result) =>
      this.action(callback, request, result);
  }

  async action(
    callback: CallbackObject,
    request: Request,
    result: any,
  ): Promise<Packet | undefined> {
    const callbackStrategy = await this.getStoreStrategy();
    if (!callbackStrategy) {
      throw new Error('No valid strategy found for PubSubSetCallbackFn');
    }
    return callbackStrategy.setCallback(callback, request, result);
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
