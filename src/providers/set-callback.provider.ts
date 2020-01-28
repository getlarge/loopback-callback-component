/* eslint-disable @typescript-eslint/no-explicit-any */
import {inject, Provider, Getter} from '@loopback/core';
import {
  CallbackObject,
  Packet,
  ResolveCallbackFn,
  CallbackStrategy,
} from '../types';
import {CallbackBindings} from '../keys';

export class ResolveCallbackFnProvider implements Provider<ResolveCallbackFn> {
  constructor(
    @inject.getter(CallbackBindings.CALLBACK_STRATEGY)
    readonly getStoreStrategy: Getter<CallbackStrategy>,
  ) {}

  value(): ResolveCallbackFn {
    return (callback, result) => this.action(callback, result);
  }

  async action(callback: CallbackObject, result: any): Promise<Packet> {
    const callbackStrategy = await this.getStoreStrategy();
    if (!callbackStrategy) {
      throw new Error('No valid strategy found for ResolveCallbackFn');
    }
    return callbackStrategy.resolveCallback(callback, result);
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
