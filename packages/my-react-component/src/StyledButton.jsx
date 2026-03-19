import styled from "styled-components";
import Button from "@splunk/react-ui/Button";
import {variables} from "@splunk/themes";

function appearanceToForegroundColor(props) {
    const {appearance, disabled} = props;
    if (disabled) {
        if (appearance === "secondary") {
            return variables.actionColorContentSecondaryDisabled;
        }
        return variables.actionColorContentPrimaryDisabled;

    }
    if (appearance === "secondary") {
        return variables.actionColorContentSecondary;
    }
    return variables.actionColorContentPrimary;

}

function appearanceToBackgroundColor(props) {
    const {appearance, disabled} = props;
    if (disabled) {
        if (appearance === "destructive") {
            return variables.actionColorBackgroundDestructiveDisabled;
        }
        if (appearance === "secondary") {
            return variables.actionColorBackgroundSecondaryDisabled;
        }
        return variables.actionColorBackgroundPrimaryDisabled;

    }
    if (appearance === "destructive") {
        return variables.actionColorBackgroundDestructive;
    }
    if (appearance === "secondary") {
        return variables.actionColorBackgroundSecondary;
    }
    return variables.actionColorBackgroundPrimary;

}

function appearanceToHoverBackgroundColor(props) {
    const {appearance, disabled} = props;
    if (disabled) {
        if (appearance === "destructive") {
            return variables.actionColorBackgroundDestructiveDisabled;
        }
        if (appearance === "secondary") {
            return variables.actionColorBackgroundSecondaryDisabled;
        }
        return variables.actionColorBackgroundPrimaryDisabled;
    }
    if (appearance === "destructive") {
        return variables.actionColorBackgroundDestructiveHover;
    }
    if (appearance === "secondary") {
        return variables.actionColorBackgroundSecondaryHover;
    }
    return variables.actionColorBackgroundPrimaryHover;

}

export const StyledButton = styled(Button)`
    flex-grow: 0;
    margin-left: ${props => (props.noMargin ? 0 : undefined)} !important;
    border-width: ${props => (props.noBorder ? 0 : undefined)};
    border-color: ${props => (props.borderColor ?? variables.borderColor)};

    background-color: ${props => appearanceToBackgroundColor(props)} !important;
    color: ${props => appearanceToForegroundColor(props)} !important;


    &:hover {
        background-color: ${props => appearanceToHoverBackgroundColor(props)} !important;
    }
`;
