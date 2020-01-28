import {CoreBindings} from '@loopback/core';
import {Constructor, Provider, inject} from '@loopback/context';
import {getCallbackMetadata} from '../decorators';
import {CallbackMetadata} from '../types';

export class CallbackMetadataProvider
  implements Provider<CallbackMetadata | undefined> {
  constructor(
    @inject(CoreBindings.CONTROLLER_CLASS, {optional: true})
    private readonly controllerClass: Constructor<{}>,
    @inject(CoreBindings.CONTROLLER_METHOD_NAME, {optional: true})
    private readonly methodName: string,
  ) {}

  value(): CallbackMetadata | undefined {
    if (!this.controllerClass || !this.methodName) return;
    return getCallbackMetadata(this.controllerClass, this.methodName);
  }
}
