import React from "react";
import Tooltip from '@splunk/react-ui/Tooltip';
import TrashCanCross from "@splunk/react-icons/TrashCanCross";
import { variables } from '@splunk/themes';
import BaseButton from "../BaseButton";

export default function DeleteIconOnlyButton({onClick, tooltipContent = "Delete", ...props}) {
    return (
        <Tooltip content={tooltipContent} onClick={onClick}>
            {/* The `to="#"` is a styling workaround, to keep the hover background a neutral colour. */}
            <BaseButton
                borderColor={variables.contentColorMuted}
                noMargin
                inline
                appearance="default"
                icon={<TrashCanCross variant="filled" hideDefaultTooltip />}
                to="#"
                {...props}
            />
        </Tooltip>
    );
}
