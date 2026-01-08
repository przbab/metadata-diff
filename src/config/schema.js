import Joi from 'joi';

const pathnameObject = Joi.alternatives()
    .try(
        Joi.string().uri({ relativeOnly: true }),
        Joi.object().keys({
            description: Joi.string(),
            note: Joi.string(),
            path: Joi.string().uri({ relativeOnly: true }).required(),
        }),
        Joi.object().keys({
            description: Joi.string(),
            name: Joi.string().required(),
            note: Joi.string(),
            pathnames: Joi.array().items(Joi.link('#pathnameObject')).min(1).required(),
        })
    )
    .id('pathnameObject');

export const schema = Joi.object({
    candidateBaseUrl: Joi.string().uri().replace(/\/$/, '').required(),
    concurrency: Joi.number().min(1).default(1),
    currentBaseUrl: Joi.string().uri().replace(/\/$/, '').required(),
    headers: Joi.object({
        'User-Agent': Joi.string().default('metadata-diff'), // TODO can I add version?
    })
        .pattern(Joi.string(), Joi.string())
        .default({
            'User-Agent': Joi.string().default('metadata-diff'),
        }),
    minify: Joi.boolean().default(true),
    output: Joi.string().default('index.html'),
    outputDir: Joi.string().default('dist'),
    parsedMetadata: Joi.object({
        linkTags: Joi.object().pattern(Joi.string(), Joi.boolean()),
        metaNameTags: Joi.object().pattern(Joi.string(), Joi.boolean()),
        metaPropertyTags: Joi.object().pattern(Joi.string(), Joi.boolean()),
    }),
    pathnames: Joi.array().items(pathnameObject).min(1).required(),
    puppeteerOptions: Joi.object().keys({
        additionalWait: Joi.number(),
        blockRequests: Joi.array().items(Joi.string()),
        goto: Joi.any(),
        headless: Joi.boolean().default(true),
        slowMo: Joi.number().min(0).default(0),
    }),
    replacements: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())).default({}),
    ssrOnly: Joi.boolean().default(false),
});
