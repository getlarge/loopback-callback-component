import {Component, ProviderMap} from '@loopback/core';
// import {inject, Constructor} from '@loopback/context';
// import {PubSubConfig} from './types';
import {PubSubBindings} from './keys';
import {
  PubSubConfigFnProvider,
  PubSubPublishFnProvider,
  PubSubSubscribeFnProvider,
  PubSubUnsubscribeFnProvider,
  PubSubIterableProvider,
  PubSubCheckCallbackFnProvider,
  PubSubSetCallbackFnProvider,
  PubSubMetadataProvider,
} from './providers';

export class PubSubComponent implements Component {
  providers?: ProviderMap;

  // constructor(@inject(PubSubBindings.PUBSUB_CONFIG) public config: PubSubConfig) {
  constructor() {
    // this.sanityCheck();
    this.providers = {
      [PubSubBindings.PUBSUB_CONFIG_ACTION.key]: PubSubConfigFnProvider,
      [PubSubBindings.PUBSUB_PUBLISH.key]: PubSubPublishFnProvider,
      [PubSubBindings.PUBSUB_SUBSCRIBE.key]: PubSubSubscribeFnProvider,
      [PubSubBindings.PUBSUB_UNSUBSCRIBE.key]: PubSubUnsubscribeFnProvider,
      [PubSubBindings.PUBSUB_ASYNC_ITERATOR.key]: PubSubIterableProvider,
      [PubSubBindings.PUBSUB_CHECK_CALLBACK.key]: PubSubCheckCallbackFnProvider,
      [PubSubBindings.PUBSUB_SET_CALLBACK.key]: PubSubSetCallbackFnProvider,
      [PubSubBindings.METADATA.key]: PubSubMetadataProvider,
    };
  }

  // sanityCheck() {
  // this.config...
  // }
}
