import styled from "styled-components";
import React from "react";
import Chip from "@splunk/react-ui/Chip";
import Calendar from '@splunk/react-icons/Calendar';
import ExclamationTriangle from '@splunk/react-icons/ExclamationTriangle';
import CheckCircle from '@splunk/react-icons/CheckCircle';
import InformationCircle from '@splunk/react-icons/InformationCircle';

import ExclamationCircle from '@splunk/react-icons/ExclamationCircle';

import PropTypes from 'prop-types';

const StyledChip = styled(Chip)`
    width: fit-content;
`;

export function SubmissionStatusChip({status}) {
    let appearance = "info";
    let icon = <InformationCircle variant="outlined"/>;
    if (status === "SCHEDULED") {
        icon = <Calendar variant="outlined"/>;
    } else if (status === "SENT") {
        appearance = 'success';
        icon = <CheckCircle variant="filled"/>;
    } else if (status === "FAILED") {
        appearance = "error";
        icon = <ExclamationTriangle variant="outlined"/>;
    } else if (status === "CANCELLED") {
        appearance = "warning";
        icon = <ExclamationCircle variant="outlined"/>;
    }

    return <StyledChip appearance={appearance} icon={icon}>{status}</StyledChip>;
}

SubmissionStatusChip.propTypes = {
    status: PropTypes.string,
}
