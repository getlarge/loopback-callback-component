import {Component, ProviderMap} from '@loopback/core';
import {CallbackBindings} from './keys';
import {
  CheckCallbackFnProvider,
  SetCallbackFnProvider,
  CallbackMetadataProvider,
} from './providers';

export class PubSubComponent implements Component {
  providers?: ProviderMap;

  constructor() {
    this.providers = {
      [CallbackBindings.CALLBACK_CHECK.key]: CheckCallbackFnProvider,
      [CallbackBindings.CALLBACK_SET.key]: SetCallbackFnProvider,
      [CallbackBindings.METADATA.key]: CallbackMetadataProvider,
    };
  }
}
