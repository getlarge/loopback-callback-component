# loopback-callback-component

A Callback component for LoopBack 4, trying to follow [GraphQL specs](https://github.com/graphql/graphql-spec/blob/master/rfcs/Subscriptions.md) and [OpenAPI Callback Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#callbackObject)


## Installation

Run the following command to install `loopback-callback-component`:

```npm
npm i -s loopback-callback-component
```

## Usage

### Import component 

When the `loopback-callback-component` package is installed, bind it to your application with `app.component()`

```typescript
import {RestApplication} from '@loopback/rest';
import {CallbackComponent, CallbackBindings, CallbackStrategyProvider} from 'loopback-callback-component';

const app = new RestApplication();

app.component(CallbackComponent);
app.bind(CallbackBindings.CALLBACK_STRATEGY).toProvider(CallbackStrategyProvider);

```

### Strategy provider

Create a strategy provider that implements your custom logic :

```typescript
import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {Request, Response} from '@loopback/rest';
import {
  CallbackBindings,
  CallbackStrategy,
  CallbackMetadata,
  CallbackObject,
  isRuntimeExpression,
  resolveTriggerName,
  resolvePayload,
} from 'loopback-callback-component';

export class CallbackStrategyProvider implements Provider<CallbackStrategy | undefined> {
  constructor(@inject(CallbackBindings.METADATA) private metadata: CallbackMetadata) {}

  value(): ValueOrPromise<CallbackStrategy | undefined> {
    return {
      checkCallback: async (request: Request, response: Response, options?: Object) => {
        if (!this.metadata) {
          return Promise.resolve(undefined);
        }

        // use this.metadata.parent to retrieve Oas path ?
        const callbackObject: CallbackObject = {
          [this.metadata.expression]: {
            [this.metadata.method]: {
              operationId: `${this.metadata.name}`,
              description: `${this.metadata.name} callback`,
              requestBody: request.body,
              parameters: request.params,
              // url: request.url,
              // method: request.method,
            },
          },
        };
        return Promise.resolve(callbackObject);
      },

      resolveCallback: async (callback: CallbackObject, result: any) => {
        if (!this.metadata) {
          throw new Error('Callback metadata are mandatory to resolve the callback');
        }
        let value = this.metadata.expression;
        const method = this.metadata.method;
        const cbName = this.metadata.name;
        const resolveData = {
          usedPayload: callback[value][method].requestBody || {},
          usedParams: callback[value][method].parameters,
          usedRequestOptions: {method},
        };

        // Replace callback expression with appropriate values
        let topic: string;
        if (value.search(/{|}/) === -1) {
          topic = isRuntimeExpression(value)
            ? resolveTriggerName(cbName, value, resolveData, result)
            : value;
        } else {
          const cbParams = value.match(/{([^}]*)}/g) ?? [];
          cbParams.forEach(cbParam => {
            value = value.replace(
              cbParam,
              resolveTriggerName(
                cbName,
                cbParam.substring(1, cbParam.length - 1),
                resolveData,
                result,
              ),
            );
          });
          topic = value;
        }

        const payload = resolvePayload(cbName, result, 'string');
        // console.log('resolved callback', topic, payload);
        return {topic, payload};
      },
    };
  }
}


```
### Custom sequence 

To create some callback to specific endpoint you first need to add this kind of logic in a loopback sequence :

```typescript
import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {
  CallbackBindings,
  CallbackCheckFn,
  CallbackResolveFn
} from 'loopback-callback-component';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(CallbackBindings.CALLBACK_RESOLVE) protected resolveCallback: CallbackResolveFn,
    @inject(CallbackBindings.CALLBACK_CHECK) protected checkCallback: CallbackCheckFn,
  ) {}


  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      const result = await this.invoke(route, args);

      let callback = await this.checkCallback(request, response);
      if (callback) {
        // compose route and payload from CallbackObject with response, request object ...
        const {topic, payload} = await this.resolveCallback(callback, request, result);
        // then you can publish { topic, payload } via a PubSub system
      }

      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    }
  }
}

```
### Use in a controller

Add a decorator on specific endpoint, to trigger a callback with parameters that will be used to compose topic and payload, from the response/request in the custom sequence.

```typescript
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  patch,
  put,
  Request,
  requestBody,
  RestBindings,
} from '@loopback/rest';
import {callback} from 'loopback-callback-component';
import {Device} from '../models';
import {DeviceApi, devicesApiEndPoint} from '../services';
import {getToken} from '../utils';

const security = [
  {
    Authorization: [],
  },
];

export class DeviceController {
  constructor(
    @inject('services.DeviceApi') protected deviceApi: DeviceApi,
    @inject(RestBindings.Http.REQUEST) public request: Request,
  ) {}

  // Adding callback decorator
  @callback(
    'deviceWatcher',
    '/api/{$response.body#/ownerId}/devices/{$method}/{$response.body#/id}',
    'post',
    {path: `/${devicesApiEndPoint}`, method: 'post'},
  )
  @post(`/${devicesApiEndPoint}`, {
    operationId: 'createDevice',
    security,
    responses: {
      '200': {
        description: 'Device instance',
        content: {'application/json': {schema: {'x-ts-type': Device}}},
      },
    },
    // todo add callbacks definition via decorator 
  })
  async create(@requestBody() device: Device): Promise<Device> {
    const token = getToken(this.request);
    return this.deviceApi.create(token, device);
  }

}

```

## TODO 

- Improve CallbackObject to mimic OpenAPI CallbackObject

- Use decorator to customize OpenAPI schema [example](https://loopback.io/doc/en/lb4/Extending-OpenAPI-specification.html)


## License

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
