import {Component, ProviderMap} from '@loopback/core';
import {CallbackBindings} from './keys';
import {
  CheckCallbackFnProvider,
  ResolveCallbackFnProvider,
  CallbackMetadataProvider,
} from './providers';

export class CallbackComponent implements Component {
  providers?: ProviderMap;

  constructor() {
    this.providers = {
      [CallbackBindings.CALLBACK_CHECK.key]: CheckCallbackFnProvider,
      [CallbackBindings.CALLBACK_RESOLVE.key]: ResolveCallbackFnProvider,
      [CallbackBindings.METADATA.key]: CallbackMetadataProvider,
    };
  }
}
