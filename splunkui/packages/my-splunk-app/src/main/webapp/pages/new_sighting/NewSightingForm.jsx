import {postCreateSighting} from "@splunk/my-page/src/ApiClient";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {FormProvider, useForm} from "react-hook-form";

import Button from "@splunk/react-ui/Button";
import Modal from '@splunk/react-ui/Modal';
import P from '@splunk/react-ui/Paragraph';
import PlusCircle from '@splunk/react-icons/PlusCircle';

import {VIEW_SIGHTINGS_PAGE} from "@splunk/my-page/src/urls";

import SubmitButton from "@splunk/my-page/src/SubmitButton";
import Heading from "@splunk/react-ui/Heading";
import Divider from "@splunk/react-ui/Divider";
import {dateNowInSecondsPrecision, dateToIsoStringWithoutTimezone} from "@splunk/my-page/src/date_utils";
import {HorizontalButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import BaseButton from "@splunk/my-page/src/BaseButton";
import {CustomControlGroup} from "@splunk/my-page/src/CustomControlGroup";
import {SubmitGroupingButton} from "@splunk/my-page/src/buttons/SubmitGroupingButton";
import Code from "@splunk/react-ui/Code";
import {v4 as uuidv4} from 'uuid';
import Message from "@splunk/react-ui/Message";
import {StyledForm} from "../../common/sighting_form/StyledForm";
import useSightingCategories from "../../common/sighting_form/sightingCategories";
import {
    FIELD_CONFIDENCE,
    FIELD_GROUPING_ID,
    FIELD_SIGHTINGS,
    FIELD_TLP_RATING,
    FIELD_VALID_FROM,
    REGISTER_FIELD_OPTIONS
} from "../../common/sighting_form/fieldNames";
import {ValidFromField} from "../../common/sighting_form/formControls";
import {SightingSubForm} from "./SightingSubForm";
import {GroupingIdFieldV2} from "../../common/sighting_form/GroupingsDropdown";
import {TLPv2RatingField} from "../../common/tlp";
import {ConfidenceField} from "../../common/confidence";

function GotoSightingsPageButton() {
    // TODO: this should probs change to viewing the sighting created?
    return (<Button to={VIEW_SIGHTINGS_PAGE} appearance="secondary" label="Go to Sightings"/>);
}

const newSightingObject = ({splunk_field_name: splunkFieldName = '', sighting_value: sightingValue = ''} = {}) => ({
    splunk_field_name: splunkFieldName,
    sighting_value: sightingValue,
    sighting_category: '',
    stix_pattern: '',
    name: '',
    description: '',
});

function getErrorsByIndex(errorsArray, index) {
    if (!errorsArray) {
        return null;
    }

    // Find the error object that matches the given index
    const errorForIndex = errorsArray.find(error => error.index === index);

    // Check if the error object for the specified index exists
    if (!errorForIndex) {
        return null;
    }

    // Return the errors array for the specified index
    return [...errorForIndex.errors];
}

function useSightingsData() {
    const [sightingIds, setSightingIds] = useState([]);
    const [sightingIdToData, setSightingIdToData] = useState({});

    const addSighting = useCallback(() => {
        console.log("Adding sighting");
        const newId = uuidv4();
        setSightingIds([...sightingIds, newId]);
        setSightingIdToData({...sightingIdToData, [newId]: newSightingObject()});
    }, [setSightingIdToData, sightingIdToData, setSightingIds, sightingIds]);

    const removeSighting = useCallback((id) => {
        console.log("Removing sighting", id);
        setSightingIds(prev => prev.filter(sightingId => sightingId !== id));
        const copyOfSightingIdToData = {...sightingIdToData};
        delete copyOfSightingIdToData[id];
        setSightingIdToData(copyOfSightingIdToData);
    }, [setSightingIds, setSightingIdToData, sightingIdToData]);

    const updateSighting = useCallback((id, delta) => {
        console.log("Updating sighting", id, delta);
        const newDelta = {...sightingIdToData[id], ...delta};
        setSightingIdToData({...sightingIdToData, [id]: newDelta});
    }, [sightingIdToData, setSightingIdToData]);
    return {
        sightingIds,
        setSightingIds,
        sightingIdToData,
        setSightingIdToData,
        addSighting,
        removeSighting,
        updateSighting
    };
}

function useSignal() {
    const [signal, setSignal] = useState(0);
    const incrementSignal = useCallback(() => setSignal(signal + 1), [signal, setSignal]);
    return {signal, incrementSignal};
}

function useValidationOrchestrator({sightingIds}) {
    const {signal, incrementSignal} = useSignal();
    const [idToValidationErrors, setIdToValidationErrors] = useState({});
    const [idToValidationCallbacks, setIdToValidationCallbacks] = useState({});
    const [isValidating, setIsValidating] = useState(false);
    const [validationPromise, setValidationPromise] = useState(null);

    useEffect(() => {
        const mapping = {};
        sightingIds.forEach(id => {
            const callback = (errors) => setIdToValidationErrors(prev => ({...prev, [id]: errors}));
            mapping[id] = callback;
        });
        setIdToValidationCallbacks(mapping);
    }, [setIdToValidationCallbacks, sightingIds]);

    useEffect(() => {
        if (Object.keys(idToValidationErrors).length === sightingIds.length) {
            setIsValidating(false);
        } else {
            setIsValidating(true);
        }
    }, [setIsValidating, isValidating, idToValidationErrors, sightingIds]);

    useEffect(() => {
        if (validationPromise && !isValidating) {
            validationPromise.resolve(idToValidationErrors);
            setValidationPromise(null);
        }
    }, [validationPromise, isValidating, idToValidationErrors]);

    const triggerValidation = useCallback(async () => {
        console.log("Triggering validation");
        setIdToValidationErrors({}); // Clear all errors
        incrementSignal()
        return new Promise((resolve, reject) => {
            setValidationPromise({resolve, reject});
        });
    }, [setValidationPromise, incrementSignal, setIdToValidationErrors]);

    return {signal, idToValidationErrors, idToValidationCallbacks, triggerValidation, isValidating};
}

export function NewSightingForm({initialSplunkFieldName, initialSplunkFieldValue, event}) {
    console.log("NewSightingForm", initialSplunkFieldName, initialSplunkFieldValue, event);
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_GROUPING_ID]: null,
            [FIELD_CONFIDENCE]: 50,
            [FIELD_TLP_RATING]: "GREEN",
            [FIELD_VALID_FROM]: dateToIsoStringWithoutTimezone(dateNowInSecondsPrecision()),
            [FIELD_SIGHTINGS]: [
                // newSightingObject({
                //     splunk_field_name: initialSplunkFieldName,
                //     sighting_value: initialSplunkFieldValue
                // })
            ]
        }
    });
    const {watch, register, trigger, handleSubmit, formState} = methods;

    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);
    const [submissionSubErrors, setSubmissionSubErrors] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);

    [FIELD_GROUPING_ID, FIELD_TLP_RATING, FIELD_CONFIDENCE, FIELD_VALID_FROM, FIELD_SIGHTINGS].forEach(fieldName => {
        register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]);
    });

    const groupingId = watch(FIELD_GROUPING_ID);
    const {sightingIds, sightingIdToData, addSighting, removeSighting, updateSighting} = useSightingsData();
    const {
        signal: validationSignal,
        idToValidationErrors,
        idToValidationCallbacks,
        triggerValidation
    } = useValidationOrchestrator({sightingIds});

    const anySubformHasErrors = (subformErrors) => {
        const filtered = Object.values(subformErrors).filter(errors => Object.keys(errors).length > 0);
        return filtered.length > 0;
    }

    const onSubmit = async (data) => {
        console.log(data);
        const mainFormIsValid = await trigger();

        const subformErrors = await triggerValidation();
        const subformsAreValid = !anySubformHasErrors(subformErrors);

        setSubmissionSubErrors(null);
        if (mainFormIsValid && subformsAreValid) {
            await postCreateSighting(data, (resp) => {
                console.log(resp);
                setSubmitSuccess(true);
                setSubmissionSubErrors(null);
            }, async (errorResponse) => {
                debugger; // eslint-disable-line no-debugger
                const errorJson = await errorResponse.json();
                console.error("Error creating sighting", errorJson);
                setSubmissionSubErrors(errorJson.errors);
                setSubmissionError(String(errorJson.error));
            });
        } else {
            console.error("Main form errors", formState.errors);
            console.error("Subform errors", subformErrors);
        }
    }

    const onFormSubmitError = async (error) => {
        console.error("Error submitting form", error);
    }

    useEffect(() => {
        if (formState.errors && Object.keys(formState.errors).length > 0) {
            console.error(formState.errors)
        }
    }, [formState])

    const {sightingCategories} = useSightingCategories();
    const formValues = watch();

    return (
        <FormProvider {...methods}>
            <StyledForm name="newSighting" onSubmit={handleSubmit(onSubmit, onFormSubmitError)}>
                <section>
                    <Heading level={2}>Common Properties</Heading>
                    <P>These properties will be shared by all sightings created on this form.</P>
                    <GroupingIdFieldV2 fieldName={FIELD_GROUPING_ID}/>
                    <ConfidenceField fieldName={FIELD_CONFIDENCE}/>
                    <TLPv2RatingField fieldName={FIELD_TLP_RATING}/>
                    <ValidFromField fieldName={FIELD_VALID_FROM}/>
                </section>
                <Divider/>
                {sightingIds.map((sightingId, index) =>
                    <SightingSubForm key={sightingId}
                                      id={sightingId}
                                      index={index}
                                      validationSignal={validationSignal}
                                      onValidationError={idToValidationCallbacks[sightingId]}
                                      updateSighting={(delta) => updateSighting(sightingId, delta)}
                                      splunkEvent={event}
                                      removeSelf={() => removeSighting(sightingId)}
                                      sightingCategories={sightingCategories}
                                      submissionErrors={getErrorsByIndex(submissionSubErrors, index)}/>
                )}
                <CustomControlGroup>
                    <HorizontalButtonLayout>
                        <BaseButton appearance="secondary" icon={<PlusCircle/>} inline label='Add Another Sighting'
                                    onClick={() => addSighting()}/>
                        <SubmitButton inline disabled={submitButtonDisabled} submitting={formState.isSubmitting}
                                      label={`Create Sightings (${sightingIds?.length})`}/>
                    </HorizontalButtonLayout>
                </CustomControlGroup>
                {submissionError && <Message appearance="fill" type="error">
                    ERROR: {submissionError}
                </Message>}
                <Modal open={submitSuccess}>
                    <Modal.Header
                        title={`Successfully Created New Sighting${sightingIds?.length > 1 ? "s" : ""}`}
                    />
                    <Modal.Body>
                        <P>To submit to TAXII server, proceed to submit the Grouping.</P>
                        <GotoSightingsPageButton/>
                        <SubmitGroupingButton groupingId={groupingId}/>
                    </Modal.Body>
                </Modal>
                <Heading level={3}>Sighting IDs</Heading>
                <Code value={JSON.stringify(sightingIds, null, 2)} language="json"/>
                <Heading level={3}>Sighting Data</Heading>
                <Code value={JSON.stringify(sightingIdToData, null, 2)} language="json"/>
                <Heading level={3}>Subforms Sighting Validation Errors</Heading>
                <Code value={JSON.stringify(idToValidationErrors, null, 2)} language="json"/>
                <Heading level={3}>Form Values</Heading>
                <Code value={JSON.stringify(formValues, null, 2)} language="json"/>
                <Heading level={3}>Errors</Heading>
                <Code value={JSON.stringify(formState.errors, null, 2)} language="json"/>
            </StyledForm>
        </FormProvider>
    );
}

NewSightingForm.propTypes = {
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
    event: PropTypes.object
};
