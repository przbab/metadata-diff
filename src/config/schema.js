import Joi from 'joi';

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
    html: Joi.string(),
    minify: Joi.boolean().default(true),
    output: Joi.string().default('metadataDiffReport.html'),
    pathnames: Joi.array()
        .items(
            Joi.string().uri({ relativeOnly: true }),
            Joi.object().keys({
                note: Joi.string(),
                path: Joi.string().uri({ relativeOnly: true }).required(),
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
});
