import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import {createSelector} from '@reduxjs/toolkit'

import {CustomControlGroup} from "@splunk/my-page/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import SubmitButton from "@splunk/my-page/src/SubmitButton";
import {postCreateSighting} from "@splunk/my-page/src/ApiClient";
import Modal from "@splunk/react-ui/Modal";
import P from "@splunk/react-ui/Paragraph";
import {SubmitGroupingButton} from "@splunk/my-page/src/buttons/SubmitGroupingButton";
import Button from "@splunk/react-ui/Button";
import {VIEW_SIGHTINGS_PAGE} from "@splunk/my-page/src/urls";
import {createToast} from "@splunk/my-page/src/AppContainer";
import PropTypes from "prop-types";
import {
    triggerValidationSignal as sightingsTrigger,
    waitingForValidation as sightingsWaitingForValidation,
    addSubmissionError,
    clearAllSubmissionErrors
} from "./Sightings.slice";
import {
    triggerValidationSignal as commonPropsTrigger,
    waitingForValidation as commonPropsWaitingForValidation
} from "./CommonProperties.slice";

import {FIELD_GROUPING_ID} from "../../common/sighting_form/fieldNames";

const waitingForValidation = createSelector(
    [
        commonPropsWaitingForValidation,
        sightingsWaitingForValidation
    ],
    (commonProps, sightings) => commonProps || sightings
)

const hasErrorsSelector = createSelector(
    [
        (state) => state.commonProperties.errors,
        (state) => state.sightings.errors
    ],
    (commonPropsErrors, sightingsErrors) => {
        const hasCommonPropsErrors = Object.keys(commonPropsErrors).length > 0;
        const hasSightingsErrors = Object.values(sightingsErrors).some(x => Object.keys(x).length > 0);
        return hasCommonPropsErrors || hasSightingsErrors;
    }
)

function GotoSightingsPageButton() {
    return (<Button to={VIEW_SIGHTINGS_PAGE} appearance="secondary" label="Go to Sightings"/>);
}
const createErrorToast = (message) => {
    createToast({
        type: 'error',
        message,
        autoDismiss: true
    })
}
export default function Submission({debugMode=false}) {
    const commonProps = useSelector((state) => state.commonProperties.data);
    const groupingId = useSelector((state) => state.commonProperties.data[FIELD_GROUPING_ID]);

    const sightings = useSelector((state) => state.sightings.sightings);
    const numSightings = Object.keys(sightings).length;

    const waiting = useSelector(waitingForValidation);

    const hasErrors = useSelector(hasErrorsSelector);

    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [sendToApiPromise, setSendToApiPromise] = useState(null);

    const dispatch = useDispatch();

    const {handleSubmit, setValue, watch} = useForm({
        mode: 'all',
        defaultValues: {
            data: {}
        }
    })
    const formData = watch('data');

    const addSubmissionErrors = useCallback((submissionErrors) => {
        dispatch(clearAllSubmissionErrors());
        submissionErrors.forEach(({index, errors}) => {
           const sightingId = Object.keys(sightings)[index];
           dispatch(addSubmissionError({
               id: sightingId,
               errors
           }));
        });
    }, [sightings, dispatch]);

    const submitToApi = useCallback(async (data) => {
        await postCreateSighting(data, (resp) => {
            console.log("Response:", resp);
            dispatch(clearAllSubmissionErrors());
            setSubmitSuccess(true);
            setSubmitting(false);
            setSendToApiPromise(null);
        }, async (errorResponse) => {
            console.error("Error submitting form to API:", errorResponse);
            const errorJson = await errorResponse.json();
            console.error("Error JSON:", errorJson);
            createErrorToast("There was a problem with the submission. Please fix any errors and try again.");
            addSubmissionErrors(errorJson.errors);
            setSubmitSuccess(false);
            setSubmitting(false);
            setSendToApiPromise(null);
        })
    }, [dispatch, addSubmissionErrors]);

    useEffect(() => {
        setValue('data', {
            ...commonProps,
            sightings: Object.values(sightings)
        })
    }, [setValue, commonProps, sightings])

    useEffect(() => {
        if (submitting && !waiting && sendToApiPromise === null) {
            console.log("Finished validation. Errors:", hasErrors);
            if (hasErrors) {
                createErrorToast("The form has errors. Please correct them before submitting.");
                setTimeout(() => setSubmitting(false), 1000);
            } else {
                setSendToApiPromise(submitToApi(formData));
            }
        }
    }, [sendToApiPromise, setSendToApiPromise, formData, submitToApi, waiting, submitting, hasErrors])

    const onSubmit = (data) => {
        console.log("Submit:", data);
        // Note that dispatch calls are synchronous
        dispatch(commonPropsTrigger());
        dispatch(sightingsTrigger());
        // set submitting to true after dispatching the validation triggers
        setSubmitting(true);
    }

    return (
        <section>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CustomControlGroup>
                    <HorizontalButtonLayout>
                        <SubmitButton inline disabled={submitting} submitting={submitting} />
                    </HorizontalButtonLayout>
                </CustomControlGroup>
            </form>
            <Modal open={submitting}>
                <Modal.Header title="Submitting form..." />
                <Modal.Body>
                    <P>Submitting form, please wait.</P>
                </Modal.Body>
            </Modal>
            <Modal open={submitSuccess}>
                <Modal.Header
                    title={`Successfully Created New Sighting${numSightings > 1 ? 's' : ''}`}
                />
                <Modal.Body>
                    <P>To submit to TAXII server, proceed to submit the Grouping.</P>
                    <HorizontalButtonLayout>
                        <GotoSightingsPageButton />
                        <SubmitGroupingButton groupingId={groupingId} />
                    </HorizontalButtonLayout>
                </Modal.Body>
            </Modal>
            {debugMode && (
                <div>
                    <div>{waiting ? 'Waiting' : 'Not Waiting'}</div>
                    <div>{submitting ? 'Submitting' : 'Not submitting'}</div>
                    {submitSuccess && <div>Submit Success</div>}
                    <div>
                        <code>{JSON.stringify(formData, null, 2)}</code>
                    </div>
                </div>
            )}
        </section>
    );
}
Submission.propTypes = {
    debugMode: PropTypes.bool
}
