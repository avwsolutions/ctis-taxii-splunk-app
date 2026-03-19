import React from 'react';
import {useSplunkTheme} from '@splunk/themes';
import Heading from '@splunk/react-ui/Heading';
import styled from 'styled-components';
import {StyledButton} from "./StyledButton";

import {StyledContainer} from './MyReactComponentStyles';


const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 1em;
`;

const MyReactComponent = () => {

    const theme = useSplunkTheme();
    console.log(theme);
    return (
        <StyledContainer>
            <Heading level={1}>Theme {theme.family} {theme.colorScheme}</Heading>
            <Heading level={2}>Enabled</Heading>
            <ButtonContainer>
                {
                    ["default", "primary", "secondary", "destructive"].map(
                        (appearance) => <StyledButton key={`button-${theme.family}-${theme.colorScheme}-${appearance}`} appearance={appearance}>hello</StyledButton> )
                }
            </ButtonContainer>
            <Heading level={2}>Disabled</Heading>
            <ButtonContainer>
                {
                    ["default", "primary", "secondary", "destructive"].map(
                        (appearance) => <StyledButton key={`button-${theme.family}-${theme.colorScheme}-${appearance}`} appearance={appearance} disabled>hello</StyledButton> )
                }
            </ButtonContainer>
        </StyledContainer>
    );
};

MyReactComponent.propTypes = {};

export default MyReactComponent;
