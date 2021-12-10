const moment = require('moment');
const helper = require('@libs/helper');
const encoderFactory = require('@libs/helper/encoder');
const handleError = require('@libs/init-rest/error-handling');
const logger = require('@libs/logger');
const checkPassword = require('../../auth-methods/password');
const grandId = require('../../auth-methods/grandid');
const audit = require('../../audit');

const log = logger.getLogger('api-careprof');

async function createToken(app, res, data) {
    const { conf } = app;
    const encoder = encoderFactory.instance({
        key2: conf.cookieSecret
    });

    const sessionId = helper.genGUID();
    const token = {
        sessionId,
        key:
            `token:careprof:${data.tenant}:${data.username}:` +
            helper.genTokenKey(),
        type: 'careprof',
        tenant: data.tenant,
        timeout: conf.session.timeout,
        timeoutAt: moment().add(conf.session.timeout, 'seconds').toISOString(),
        expiresAt: moment().add(conf.session.duration, 'seconds').toISOString(),

        careunit: data.careunit,
        mses: data.careprof.mses,
        _id: data.careprof._id,
        username: data.careprof.username,
        hsaId: data.careprof.hsaId,
        careunitId: data.careprof.careunitId,
        personalNumber: data.careprof.personalNumber,
        name: data.careprof.name
    };

    await app.bus.set(token.key, token, conf.session.timeout);

    res.cookie('token', encoder.encrypt(token.key, true), {
        maxAge: conf.session.duration * 1000,
        httpOnly: true
    });

    return token;
}

function returnToken(res, token) {
    res.json({
        type: token.type,
        tenant: token.tenant,
        careunit: token.careunit,
        timeoutAt: token.timeoutAt,
        expiresAt: token.expiresAt
    });
}

module.exports = (app) => {
    const { conf, grpcClient } = app;
    const grandIdClient = grandId.create(conf);

    return {
        async authCareprofPassword(req, res) {
            try {
                const { careunit, username } = req.body;
                const tenant = await grpcClient.msgRegistry.getTenant({
                    code: req.tenant
                });

                if (
                    !tenant ||
                    !tenant.passwordAuth ||
                    tenant.isActive === false
                ) {
                    return handleError(req, res, {
                        customMessageId: 'incorrect_tenant_or_credentials',
                        code: 401
                    });
                }

                const careprof = await grpcClient.msbReference.getCareprofAuth({
                    tenant: tenant.code,
                    careunit,
                    username
                });

                if (!careprof)
                    return handleError(req, res, {
                        customMessageId:
                            'incorrect_tenant_or_careunit_or_credentials',
                        code: 401
                    });

                if (!checkPassword(req.body, careprof))
                    return handleError(req, res, {
                        customMessageId:
                            'incorrect_tenant_or_careunit_or_credentials',
                        code: 401
                    });

                const token = await createToken(app, res, {
                    tenant: tenant.code,
                    careunit,
                    careprof
                });

                await audit.careprof.authComplete(app, token);
                returnToken(res, token);
            } catch (err) {
                handleError(req, res, err);
            }
        },

        async authCareprofSithsStart(req, res) {
            try {
                const { callbackUrl } = req.body;
                const tenant = await grpcClient.msgRegistry.getTenant({
                    code: req.tenant
                });

                if (!tenant || tenant.isActive === false) {
                    return handleError(req, res, {
                        customMessageId: 'incorrect_tenant',
                        code: 401
                    });
                }

                const grandid = tenant.grandid || {};
                const grandIdResponse = await grandIdClient.siths.start({
                    apiKey: grandid.apiKey,
                    authenticateServiceKey: grandid.sithsServiceKey,
                    callbackUrl
                });

                if (grandIdResponse.errorObject) {
                    return handleError(req, res, {
                        customMessageId: `grandid_error_${grandIdResponse.errorObject.code}`,
                        code: grandIdResponse.errorObject.statusCode
                    });
                }

                let [redirectUrlBase, redirectUrlQuery] =
                    grandIdResponse.redirectUrl.split('&redirect=');

                redirectUrlQuery += `?grandidsession=${grandIdResponse.sessionId}`;
                redirectUrlQuery = encodeURIComponent(redirectUrlQuery);
                await audit.careprof.authStart(
                    app,
                    req,
                    grandIdResponse.sessionId
                );

                return res.json({
                    sessionId: grandIdResponse.sessionId,
                    netid: `${redirectUrlBase}&redirect=${redirectUrlQuery}`
                });
            } catch (err) {
                handleError(req, res, err);
            }
        },

        async authCareprofSithsFinish(req, res) {
            try {
                const { careunit, sessionId } = req.body;
                const tenant = await grpcClient.msgRegistry.getTenant({
                    code: req.tenant
                });
                const grandid = tenant.grandid || {};
                const grandIdResponse = await grandIdClient.siths.finish({
                    apiKey: grandid.apiKey,
                    authenticateServiceKey: grandid.sithsServiceKey,
                    sessionId
                });

                if (grandIdResponse.errorObject) {
                    return handleError(req, res, {
                        customMessageId: `grandid_error_${grandIdResponse.errorObject.code}`,
                        code: grandIdResponse.errorObject.statusCode
                    });
                }

                if (!grandIdResponse.username) {
                    return handleError(req, res, {
                        customMessageId: `grandid_error_username_missing`,
                        code: 401
                    });
                }

                const hsaId = grandIdResponse.username.split('-').pop();
                const careprof = await grpcClient.msbReference.getCareprofAuth({
                    tenant: tenant.code,
                    careunit,
                    hsaId
                });

                if (!careprof)
                    return handleError(req, res, {
                        customMessageId:
                            'incorrect_tenant_or_careunit_or_hsaid',
                        code: 401
                    });

                const token = await createToken(app, res, {
                    tenant: tenant.code,
                    careunit,
                    careprof
                });

                await audit.careprof.authComplete(app, token, sessionId);
                returnToken(res, token);
            } catch (err) {
                handleError(req, res, err);
            }
        },

        async getSession(req, res) {
            try {
                if (moment() < moment(req.token.expiresAt)) {
                    req.token.timeoutAt = moment()
                        .add(req.token.timeout, 'seconds')
                        .toISOString();

                    await app.bus.set(
                        req.token.key,
                        req.token,
                        req.token.timeout
                    );
                }

                const { type, tenant, careunit, timeoutAt, expiresAt } =
                    req.token;

                await audit.careprof.sessionProlong(app, req.token);

                res.json({
                    type,
                    tenant,
                    careunit,
                    timeoutAt,
                    expiresAt
                });
            } catch (err) {
                handleError(req, res, err);
            }
        },

        async deauth(req, res) {
            try {
                const token = req.credentials;
                if (token) {
                    if (token.type !== 'careprof') {
                        return handleError(req, res, {
                            customMessageId: `wrong_user_type`,
                            code: 403
                        });
                    }

                    await app.bus.del(token.key);
                    await app.bus.xpost(
                        'messages:sign-out',
                        {},
                        { tokenKey: token.key }
                    );

                    await audit.careprof.logout(app, token);
                }

                res.clearCookie('token', { httpOnly: true });
                res.json({});
            } catch (err) {
                handleError(req, res, err);
            }
        }
    };
};
