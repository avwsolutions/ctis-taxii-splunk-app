import styled from "styled-components";
import Button from "@splunk/react-ui/Button";
import {variables} from "@splunk/themes";

function appearanceToForegroundColor(appearance) {
    if(appearance === "secondary"){
        return variables.actionColorContentSecondary;
    }
    return variables.white;
}

function appearanceToBackgroundColor(appearance) {
    if(appearance === "destructive"){
        return variables.actionColorBackgroundDestructive;
    }
    if(appearance === "secondary"){
        return variables.actionColorBackgroundSecondary;
    }
    return variables.actionColorBackgroundPrimary;
}

function appearanceToHoverBackgroundColor(appearance) {
    if(appearance === "destructive"){
        return variables.actionColorBackgroundDestructiveHover;
    }
    if(appearance === "secondary"){
        return variables.actionColorBackgroundSecondaryHover;
    }
    return variables.actionColorBackgroundPrimaryHover;
}

// TODO: Handle disabled button styling (not needed currently)

export const StyledButton = styled(Button)`
    flex-grow: 0;
    margin-left: ${props => (props.noMargin ? 0 : undefined)} !important;
    border-width: ${props => (props.noBorder ? 0 : undefined)};
    border-color: ${props => (props.borderColor ?? undefined)};

    background-color: ${props => appearanceToBackgroundColor(props?.appearance)} !important;
    color: ${props => appearanceToForegroundColor(props?.appearance)} !important;


    &:hover {
        background-color: ${props => appearanceToHoverBackgroundColor(props?.appearance)} !important;
    }
`;
