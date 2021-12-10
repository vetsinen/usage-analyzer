module.exports = (req, res, err) => {
    if (err.schemaErrors) {
        res.status(err.code || 500);
        res.json({
            messageId: err.customMessageId,
            errors: err.schemaErrors
        });
    } else if (err.customMessageId) {
        res.status(err.code || 500);
        res.json({
            messageId: err.customMessageId,
            ...err.data
        });
    } else if (err.name && err.name == 'MongoError') {
        res.status(500);
        res.json({
            messageId: 'unexpected_database_error',
            errorDesc: err.errmsg
        });
    } else if (err.grpc) {
        res.status(500);
        if (err.takeCare) {
            if (err.details == 'emr_request_timeout')
                res.json({
                    messageId: 'emr_request_timeout'
                });
            else
                res.json({
                    messageId: 'unexpected_takecare_response',
                    errorDesc: err.details
                });
        } else {
            res.json({
                messageId: 'unexpected_error',
                errorDesc: err.details
            });
        }
    } else {
        res.status(500);
        res.json({
            messageId: 'unexpected_error',
            errorDesc: err.message || err.toString()
        });
    }
};
