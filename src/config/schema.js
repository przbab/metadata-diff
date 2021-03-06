'use strict';

const Joi = require('joi');

const schema = Joi.object({
    candidateBaseUrl: Joi.string().uri().replace(/\/$/, '').required(),
    currentBaseUrl: Joi.string().uri().replace(/\/$/, '').required(),
    html: Joi.string(),
    minify: Joi.boolean().default(true),
    output: Joi.string().default('metadataDiffReport.html'),
    pathnames: Joi.array()
        .items(
            Joi.string().uri({ relativeOnly: true }),
            Joi.object().keys({
                path: Joi.string().uri({ relativeOnly: true }).required(),
                note: Joi.string(),
            })
        )
        .min(1)
        .required(),
    puppeteerOptions: Joi.object().keys({
        additionalWait: Joi.number(),
        blockRequests: Joi.array().items(Joi.string()),
        goto: Joi.any(),
        headless: Joi.boolean().default(true),
        slowMo: Joi.number().min(0).default(0),
    }),
    replaceBaseUrls: Joi.boolean().default(true),
    replacements: Joi.array().items(
        Joi.object().keys({
            flags: Joi.string().default(''),
            regExp: Joi.string().required(),
            replace: Joi.string().required(),
        })
    ),
    scripts: Joi.string(),
    styles: Joi.string(),
    userAgent: Joi.string().default('metadata-diff'),
    logLevel: Joi.string().allow('error', 'warn', 'info', 'verbose', 'debug', 'silly').default('info'),
    logToFile: Joi.boolean().default(false),
    logFilename: Joi.string().default('metadata-diff.log'),
    concurrency: Joi.number().min(1).default(1),
});

module.exports = { schema };
