'use strict';

const Joi = require('joi');

const schema = Joi.object({
    candidateBaseUrl: Joi.string()
        .uri()
        .required(),
    currentBaseUrl: Joi.string()
        .uri()
        .required(),
    html: Joi.string().default('./src/page/index.html'),
    minify: Joi.boolean().default(true),
    output: Joi.string().default('metadataDiffReport.html'),
    pathnames: Joi.array()
        .items(Joi.string().uri({ relativeOnly: true }))
        .min(1)
        .required(),
    puppeteerOptions: Joi.object().keys({
        additionalWait: Joi.number(),
        blockRequests: Joi.array().items(Joi.string()),
        goto: Joi.any(),
    }),
    replaceBaseUrls: Joi.boolean().default(true),
    replacements: Joi.array().items(
        Joi.object().keys({
            flags: Joi.string().default(''),
            regExp: Joi.string().required(),
            replace: Joi.string().required(),
        })
    ),
    scripts: Joi.string().default('./src/page/scripts.js'),
    styles: Joi.string().default('./src/page/styles.css'),
    userAgent: Joi.string().default('metadata-diff'),
});

module.exports = schema;
