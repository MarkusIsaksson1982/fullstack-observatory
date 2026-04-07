const express = require('express');
const { z } = require('zod');

const { ValidationError } = require('../utils/errors');

const zodTypes = {
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  object: z.record(z.unknown()),
  array: z.array(z.unknown())
};

function createValidate(schemaDefinition, options = {}) {
  const parser = express.json({
    limit: options.limit || '1mb',
    strict: true,
    type: ['application/json', 'application/*+json'],
    verify(req, res, buffer) {
      req.rawBody = buffer.toString('utf8');
    }
  });

  return function validate(req, res, next) {
    parser(req, res, (parseError) => {
      if (parseError) {
        return next(new ValidationError('Request body must be valid JSON'));
      }

      if (
        !req.rawBody ||
        !req.rawBody.trim() ||
        !req.body ||
        typeof req.body !== 'object' ||
        Array.isArray(req.body)
      ) {
        return next(new ValidationError('Request body must be valid JSON'));
      }

      for (const [key, rule] of Object.entries(schemaDefinition)) {
        const hasKey = Object.prototype.hasOwnProperty.call(req.body, key);

        if (rule.required && !hasKey) {
          return next(
            new ValidationError(`Missing required field: "${key}"`)
          );
        }

        if (!hasKey || !rule.type) {
          continue;
        }

        const validator = zodTypes[rule.type];

        if (!validator) {
          return next(
            new ValidationError(`Field "${key}" must be of type ${rule.type}`)
          );
        }

        if (!validator.safeParse(req.body[key]).success) {
          return next(
            new ValidationError(`Field "${key}" must be of type ${rule.type}`)
          );
        }
      }

      return next();
    });
  };
}

module.exports = createValidate;
