async function authCareprofSithsStart(req, res) {
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
}

async function artSithsStart(req, res) {
    try {
        const { callbackUrl } = req.body;
        const tenant = await grpcClient.msgRegistry.getTenant({
            code: req.tenant
        });

        if (!tenant || tenant.isActive === false) {
            return handleError(req, res, {
                customMessageId: 'artificial_tenant',
                code: 69
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
}