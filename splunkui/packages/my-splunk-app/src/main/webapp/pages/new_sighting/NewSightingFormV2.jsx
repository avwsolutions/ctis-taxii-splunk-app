import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Provider, useDispatch, useSelector} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";
import Loader from "@splunk/my-page/src/Loader";
import styled from "styled-components";
import {variables} from "@splunk/themes";
import Divider from "@splunk/react-ui/Divider";
import PlusCircle from "@splunk/react-icons/PlusCircle";
import {HeadingNoMargin} from "@splunk/my-page/src/MyHeading";
import CommonPropertiesForm from "./CommonPropertiesForm";

import {addSighting, sightingsSlice, removeSighting} from "./Sightings.slice";
import {commonPropertiesSlice} from "./CommonProperties.slice";
import SightingSubForm from "./SightingSubFormV2";
import Submission from "./Submission";
import useSightingCategories from "../../common/sighting_form/sightingCategories";
import {FIELD_SPLUNK_FIELD_NAME} from "../../common/sighting_form/fieldNames";

export const MaxWidthContainer = styled.div`
    max-width: 1200px;
    margin-bottom: ${variables.spacingLarge};
`

const store = configureStore({
    reducer: {
        commonProperties: commonPropertiesSlice.reducer,
        sightings: sightingsSlice.reducer
    }
});
const DisplayState = () => {
    const data = useSelector((state) => state.commonProperties.data);
    const errors = useSelector((state) => state.commonProperties.errors);
    const sightings = useSelector((state) => state.sightings.sightings);
    const sightingsErrors = useSelector((state) => state.sightings.errors);
    const submissionErrors = useSelector((state) => state.sightings.submissionErrors);
    const validationSignal = useSelector((state) => state.sightings.signal);
    const validationSignalsResponded = useSelector((state) => state.sightings.lastSignalRespondedTo);
    return <div>
        <h2>Common Props - Data</h2>
        <code>
            {JSON.stringify(data, null, 2)}
        </code>

        <h2>Common Props - Errors</h2>
        <code>
            {JSON.stringify(errors, null, 2)}
        </code>

        <h2>Sightings</h2>
        <code>
            {JSON.stringify(sightings, null, 2)}
        </code>

        <h2>Sightings - Validation Errors</h2>
        <code>
            {JSON.stringify(sightingsErrors, null, 2)}
        </code>
        <h2>Sightings - Validation Errors - Signals</h2>
        <div>Current validation signal: {String(validationSignal)}</div>
        <code>
            {JSON.stringify(validationSignalsResponded, null, 2)}
        </code>
        <h2>Sightings - Submission Errors</h2>
        <code>
            {JSON.stringify(submissionErrors, null, 2)}
        </code>
    </div>
}

const AddAnotherSightingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 100px;
    border: 1px dotted ${variables.contentColorMuted};
    margin-bottom: ${variables.spacingMedium};
    &:hover {
        cursor: pointer;
        background-color: ${variables.backgroundColorHover};
    }
`
const AddAnotherSighting = () => {
    const dispatch = useDispatch();
    const onClickHandler = () => dispatch(addSighting());
    return <AddAnotherSightingContainer onClick={onClickHandler}>
        <PlusCircle width='30px' height='30px'/>
        <HeadingNoMargin level={3}>
            Add another Sighting to this form
        </HeadingNoMargin>
    </AddAnotherSightingContainer>
}

const DisplaySightings = ({splunkEvent, initialSplunkFieldName, sightingCategories}) => {
    const dispatch = useDispatch();
    const sightings = useSelector((state) => state.sightings.sightings);
    const submissionErrors = useSelector((state) => state.sightings.submissionErrors);
    const numSightings = Object.keys(sightings).length;
    const [initialised, setInitialised] = useState(false);

    useEffect(() => {
        if (!initialised) {
            if (splunkEvent && initialSplunkFieldName) {
                dispatch(addSighting({
                    [FIELD_SPLUNK_FIELD_NAME]: initialSplunkFieldName,
                }));
            } else {
                dispatch(addSighting()); // Blank form
            }
        }
        setInitialised(true);
    }, [initialised, setInitialised, dispatch, splunkEvent, initialSplunkFieldName]);

    return <>
        {Object.keys(sightings).map((key, index) =>
            <SightingSubForm key={key} index={index} id={key}
                              removeSelfEnabled={numSightings > 1}
                              removeSelf={() => dispatch(removeSighting({id: key}))}
                              splunkEvent={splunkEvent}
                              sightingCategories={sightingCategories}
                              submissionErrors={submissionErrors[key] || []}
            />
        )}
        <AddAnotherSighting/>
    </>
}

DisplaySightings.propTypes = {
    splunkEvent: PropTypes.object,
    initialSplunkFieldName: PropTypes.string,
    sightingCategories: PropTypes.array
};

const debugMode = false;

function ComponentWithStoreContext({splunkEvent, initialSplunkFieldName}) {
    const {sightingCategories, loading: loadingCategories} = useSightingCategories();
    return <MaxWidthContainer>
        <Loader loading={loadingCategories}>
            <CommonPropertiesForm/>
            <Divider/>
            <DisplaySightings splunkEvent={splunkEvent} initialSplunkFieldName={initialSplunkFieldName}
                               sightingCategories={sightingCategories}/>
            {debugMode && <DisplayState/>}
            <Submission debugMode={debugMode}/>
        </Loader>
    </MaxWidthContainer>
}

ComponentWithStoreContext.propTypes = {
    splunkEvent: PropTypes.object,
    initialSplunkFieldName: PropTypes.string,
};

export function NewSightingFormV2({initialSplunkFieldName, initialSplunkFieldValue, event}) {
    console.log('NewSightingFormV2', {initialSplunkFieldName, initialSplunkFieldValue, event});
    return <>
        <Provider store={store}>
            <ComponentWithStoreContext splunkEvent={event} initialSplunkFieldName={initialSplunkFieldName}/>
        </Provider>

    </>
}

NewSightingFormV2.propTypes = {
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
    event: PropTypes.object
};
