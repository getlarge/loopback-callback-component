import {bind, inject} from '@loopback/core';
import {
  mergeOpenAPISpec,
  asSpecEnhancer,
  OASEnhancer,
  OpenApiSpec,
  RequestBodyObject,
  ResponsesObject,
  // CallbackObject
} from '@loopback/openapi-v3';
import {PubSubBindings} from '../keys';
import {PubSubMetadata} from '../types';

/**
 * WIP
 * A spec enhancer to add OpenAPI callbacks in an operation spec
 */
@bind(asSpecEnhancer)
export class CallbackSpecEnhancer implements OASEnhancer {
  // name = 'info';
  name: string;
  expression: string;
  method: string;
  operationId?: string;
  description?: string;
  requestBody?: RequestBodyObject;
  responses?: ResponsesObject;
  parentOperation: string;
  parentMethod: string;

  constructor(
    @inject(PubSubBindings.METADATA) private metadata: PubSubMetadata,
  ) {
    this.name = metadata.name;
    this.expression = metadata.expression;
    this.method = metadata.method;
    this.parentOperation = metadata.parent.path;
    this.parentMethod = metadata.parent.method;
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    // first retrieve parent operation ?
    // then merge callbacks into it ?
    // Or just add the CallbackObject in the OpenAPI components/callbacks ?
    // then merge full object into openAPI
    const CallbackPatchSpec = {
      callbacks: {
        [this.name]: {
          [this.expression]: {
            [this.method]: {
              operationId: this.operationId,
              description: this.description,
              requestBody: this.requestBody,
              responses: this.responses,
            },
          },
        },
      },
    };

    const mergedSpec = mergeOpenAPISpec(spec, CallbackPatchSpec);
    return mergedSpec;
  }
}
