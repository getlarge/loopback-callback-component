import {inject, Provider, Getter} from '@loopback/core';
import {Request, Response} from '@loopback/rest';
import {CallbackObject, CheckCallbackFn, CallbackStrategy} from '../types';
import {CallbackBindings} from '../keys';

export class CheckCallbackFnProvider implements Provider<CheckCallbackFn> {
  constructor(
    @inject.getter(CallbackBindings.CALLBACK_STRATEGY)
    readonly getStoreStrategy: Getter<CallbackStrategy>,
  ) {}

  value(): CheckCallbackFn {
    return (request, response, options) =>
      this.action(request, response, options);
  }

  async action(
    request: Request,
    response: Response,
    options?: Object,
  ): Promise<CallbackObject | undefined> {
    const callbackStrategy = await this.getStoreStrategy();
    if (!callbackStrategy) {
      throw new Error('No valid strategy found for PubSubCheckCallbackFn');
    }
    return callbackStrategy.checkCallback(request, response, options);
  }
}
