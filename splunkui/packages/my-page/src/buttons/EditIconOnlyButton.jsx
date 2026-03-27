import React from "react";
import Tooltip from '@splunk/react-ui/Tooltip';
import Pencil from "@splunk/react-icons/Pencil";
import {variables} from "@splunk/themes";
import BaseButton from "../BaseButton";

export default function EditIconOnlyButton({onClick, to, tooltipContent="Edit", ...props}) {
    return (
        <Tooltip content={tooltipContent} onClick={onClick}>
            <BaseButton borderColor={variables.contentColorMuted} noMargin inline appearance="default" icon={<Pencil variant="filled" hideDefaultTooltip/>} to={to} {...props}/>
        </Tooltip>
    );
}
