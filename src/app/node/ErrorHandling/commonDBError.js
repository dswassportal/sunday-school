function handleDBError(errorType) {

    switch (errorType) {

        case 'queryExecutionError': {
            return {
                data: {
                    status: 'failed',
                    errorCode: 'CH501',
                    errorMessage: 'Internal Error Occured'
                }
            }
        }
        case 'connectionError': {
            return {
                data: {
                    status: 'failed',
                    errorCode: 'CH502',
                    errorMessage: 'Internal Error Occured'
                }
            }
        }
        case 'transactionError': {
            return {
                data: {
                    status: 'failed',
                    errorCode: 'CH503',
                    errorMessage: 'Internal Error Occured'
                }
            }
        }
        case 'not_approved': {
            return {
                data: {
                    status: 'failed',
                    errorCode: 'CH504',
                    errorMessage: 'Your account is not approved yet.'
                }
            }
        }
        case 'account_deleted': {
            return {
                data: {
                    status: 'failed',
                    errorCode: 'CH505',
                    errorMessage: 'User does not exist.'
                }
            }
        }
        case 'cat_grp_map_error': {
            return {
                data: {
                    status: 'failed',
                    errorCode: 'CH506',
                    errorMessage: 'Please remove category group assignment for the category you want to remove.'
                }
            }

        }
        case 'cat_staff_map_error': {
            return {
                data: {
                    status: 'failed',
                    errorCode: 'CH507',
                    errorMessage: 'Please remove category judge assignment for the category you want to remove.'
                }
            }

        }
        case 'grp_del_not_allowed': {
            return {
                data: {
                    status: 'failed',
                    errorCode: 'CH509',
                    errorMessage: 'Please remove category group assignment for the group you want to remove.'
                }
            }

        }

    }
}

module.exports = {
    handleDBError
}