/* eslint-disable @typescript-eslint/no-explicit-any */
import * as JSONPath from 'jsonpath-plus';
// Code extracted and slightly modified from openapi-to-graphql

enum CaseStyle {
  PascalCase, // Used for type names
  camelCase, // Used for (input) object field names
  ALL_CAPS, // Used for enum values
}

/**
 * Capitalizes a given string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Uncapitalizes a given string
 */
function uncapitalize(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * First sanitizes given string and then also camel-cases it.
 */
function sanitize(str: string, caseStyle: CaseStyle): string {
  /**
   * Remove all GraphQL unsafe characters
   */
  const regex =
    caseStyle === CaseStyle.ALL_CAPS
      ? /[^a-zA-Z0-9_]/g // ALL_CAPS has underscores
      : /[^a-zA-Z0-9]/g;
  let sanitized = str.split(regex).reduce((path, part) => {
    if (caseStyle === CaseStyle.ALL_CAPS) {
      return path + '_' + part;
    } else {
      return path + capitalize(part);
    }
  });

  switch (caseStyle) {
    case CaseStyle.PascalCase:
      // The first character in PascalCase should be uppercase
      sanitized = capitalize(sanitized);
      break;

    case CaseStyle.camelCase:
      // The first character in camelCase should be lowercase
      sanitized = uncapitalize(sanitized);
      break;

    case CaseStyle.ALL_CAPS:
      sanitized = sanitized.toUpperCase();
      break;
  }

  // Special case: we cannot start with number, and cannot be empty:
  if (/^[0-9]/.test(sanitized) || sanitized === '') {
    sanitized = '_' + sanitized;
  }

  return sanitized;
}

/**
 * Returns object | array where all object keys are sanitized. Keys passed in
 * exceptions are not sanitized.
 */
export function sanitizeObjKeys(
  object: object | Array<any>,
  exceptions: string[] = [],
): object | Array<any> | null {
  const cleanKeys = (obj: object | Array<any>): object | Array<any> | null => {
    if (obj === null || typeof obj === 'undefined') {
      return null;
    } else if (Array.isArray(obj)) {
      return obj.map(cleanKeys);
    } else if (typeof obj === 'object') {
      const res: object = {};
      for (const key in obj) {
        if (!exceptions.includes(key)) {
          const saneKey = sanitize(key, CaseStyle.camelCase);
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            res[saneKey] = cleanKeys(obj[key]);
          }
        } else {
          res[key] = cleanKeys(obj[key]);
        }
      }
      return res;
    } else {
      return obj;
    }
  };
  return cleanKeys(object);
}

export function isRuntimeExpression(str: string): boolean {
  const references = ['header.', 'query.', 'path.', 'body'];
  if (str === '$url' || str === '$method' || str === '$statusCode') {
    return true;
  } else if (str.startsWith('$request.')) {
    for (const reference of references) {
      if (str.startsWith(`$request.${reference}`)) {
        return true;
      }
    }
  } else if (str.startsWith('$response.')) {
    for (const reference of references) {
      if (str.startsWith(`response.${reference}`)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Given a link parameter, determine the value
 *
 * The link parameter is a reference to data contained in the
 * url/method/statuscode or response/request body/query/path/header
 */
export function resolveTriggerName(
  callbackName: string,
  value: string,
  resolveData: any,
  root: any,
): any {
  if (value === '$url') {
    return resolveData.usedRequestOptions.url;
  } else if (value === '$method') {
    return resolveData.usedRequestOptions.method;
  } else if (value === '$statusCode') {
    return resolveData.usedStatusCode;
  } else if (value.startsWith('$request.')) {
    // CASE: parameter is previous body
    if (value === '$request.body') {
      return resolveData.usedPayload;

      // CASE: parameter in previous body
    } else if (value.startsWith('$request.body#')) {
      const tokens = JSONPath.JSONPath({
        path: value.split('body#/')[1],
        json: resolveData.usedPayload,
      });
      if (Array.isArray(tokens) && tokens.length > 0) {
        return tokens[0];
      } else {
        console.error(
          `Warning: could not extract parameter '${callbackName}' from callback`,
        );
      }

      // CASE: parameter in previous query parameter
    } else if (value.startsWith('$request.query')) {
      return resolveData.usedParams[
        sanitize(value.split('query.')[1], CaseStyle.camelCase)
      ];

      // CASE: parameter in previous path parameter
    } else if (value.startsWith('$request.path')) {
      return resolveData.usedParams[
        sanitize(value.split('path.')[1], CaseStyle.camelCase)
      ];

      // CASE: parameter in previous header parameter
    } else if (value.startsWith('$request.header')) {
      return resolveData.usedRequestOptions.headers[value.split('header.')[1]];
    }
  } else if (value.startsWith('$response.')) {
    /**
     * CASE: parameter is body
     *
     * NOTE: may not be used because it implies that the operation does not
     * return a JSON object and OpenAPI-to-GraphQL does not create GraphQL
     * objects for non-JSON data and links can only exists between objects.
     */
    if (value === '$response.body') {
      const result = JSON.parse(JSON.stringify(root));
      /**
       * _openAPIToGraphQL contains data used by OpenAPI-to-GraphQL to create the GraphQL interface
       * and should not be exposed
       */
      result._openAPIToGraphQL = undefined;
      return result;

      // CASE: parameter in body
    } else if (value.startsWith('$response.body#')) {
      const tokens = JSONPath.JSONPath({
        path: value.split('body#/')[1],
        json: root,
      });
      if (Array.isArray(tokens) && tokens.length > 0) {
        return tokens[0];
      } else {
        console.error(
          `Warning: could not extract parameter '${callbackName}' from callback`,
        );
      }

      // CASE: parameter in query parameter
    } else if (value.startsWith('$response.query')) {
      // NOTE: handled the same way $request.query is handled
      return resolveData.usedParams[
        sanitize(value.split('query.')[1], CaseStyle.camelCase)
      ];

      // CASE: parameter in path parameter
    } else if (value.startsWith('$response.path')) {
      // NOTE: handled the same way $request.path is handled
      return resolveData.usedParams[
        sanitize(value.split('path.')[1], CaseStyle.camelCase)
      ];

      // CASE: parameter in header parameter
    } else if (value.startsWith('$response.header')) {
      return resolveData.responseHeaders[value.split('header.')[1]];
    }
  }

  throw new Error(
    `Cannot create link because '${value}' is an invalid runtime expression`,
  );
}

export function resolvePayload(
  callbackName: string,
  result: any,
  typeOfResponse: string,
) {

  let responseBody;
  let saneData;

  if (typeof result === 'object') {
    if (typeOfResponse === 'object') {
      if (Buffer.isBuffer(result)) {
        try {
          responseBody = JSON.parse(result.toString());
        } catch (e) {
          const errorString =
            `Cannot JSON parse result` +
            `operation ${callbackName} ` +
            `even though it has content-type 'application/json'`;
          console.error(errorString);
          return null;
        }
      } else {
        responseBody = result;
      }
      saneData = sanitizeObjKeys(result);
    } else if (
      (Buffer.isBuffer(result) || Array.isArray(result)) &&
      typeOfResponse === 'string'
    ) {
      saneData = result.toString();
    }
  } else if (typeof result === 'string') {
    if (typeOfResponse === 'object') {
      try {
        responseBody = JSON.parse(result);
        saneData = sanitizeObjKeys(responseBody);
      } catch (e) {
        const errorString =
          `Cannot JSON parse result` +
          `operation ${callbackName} ` +
          `even though it has content-type 'application/json'`;
        console.error(errorString);

        return null;
      }
    } else if (typeOfResponse === 'string') {
      saneData = result;
    }
  }

  return saneData ? saneData : result;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
