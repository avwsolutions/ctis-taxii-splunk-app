import styled from "styled-components";
import Button from "@splunk/react-ui/Button";
import {variables, pick} from "@splunk/themes";

function getForegroundColor(props) {
    const {appearance, disabled} = props;
    if (disabled) {
        if (appearance === "secondary") {
            return variables.actionColorContentSecondaryDisabled;
        }
        return pick({
            light: variables.actionColorContentPrimaryDisabled,
            dark: variables.actionColorContentSecondaryDisabled,
        })

    }
    if (appearance === "secondary") {
        return variables.actionColorContentSecondary;
    }
    return pick({
        light: variables.actionColorContentPrimary,
        dark: variables.actionColorContentSecondary,
    })

}

function getBackgroundColor(props) {
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

function getHoverBackgroundColor(props) {
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

    background-color: ${props => getBackgroundColor(props)} !important;
    color: ${props => getForegroundColor(props)} !important;


    &:hover {
        background-color: ${props => getHoverBackgroundColor(props)} !important;
    }
`;
