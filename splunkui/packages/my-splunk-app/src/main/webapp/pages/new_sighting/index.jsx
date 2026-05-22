import React from 'react';
import {AppContainer} from "@splunk/my-page/src/AppContainer";
import SightingForm from '../../common/SightingForm';
import {layoutWithTheme} from "../../common/theme";

function MainComponent() {
    return (
        <AppContainer>
            <SightingForm/>
        </AppContainer>
    )
}

layoutWithTheme(<MainComponent/>);