import styled from "styled-components";
import React, {useEffect} from "react";
import {FormProvider, useForm} from "react-hook-form";
import SubmitButton from "@splunk/my-page/src/SubmitButton";
import {editSighting, getSighting, postCreateSighting, useGetRecord} from "@splunk/my-page/src/ApiClient";
import Message from "@splunk/react-ui/Message";
import Modal from "@splunk/react-ui/Modal";
import Button from "@splunk/react-ui/Button";
import {VIEW_SIGHTINGS_PAGE} from "@splunk/my-page/src/urls";
import Loader from "@splunk/my-page/src/Loader";
import {CustomControlGroup} from "@splunk/my-page/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-page/src/PageHeading";
import {SightingClassField, SightingIdField, NameField} from "./sighting_form/fields";
import {useOnFormSubmit} from "./formSubmit";
import {usePageTitle} from "./utils";

import {FORM_FIELD_TLP_V2_RATING, FORM_FIELD_TLP_V2_RATING_OPTION, TLPv2RatingField} from "./tlp";
import {ConfidenceField, FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION} from "./confidence";

const MyForm = styled.form`
    max-width: 600px;
`

const FORM_FIELD_NAME = "name";
const FORM_FIELD_SIGHTING_CLASS = "sighting_class";

// For edit mode
const FORM_FIELD_SIGHTING_ID = "sighting_id";

const SIGHTING_CLASSES = [
    {label: 'Individual', value: 'individual'},
    {label: 'Organization', value: 'organization'},
    {label: 'Group', value: 'group'},
    {label: 'Class', value: 'class'},
    {label: 'Unknown', value: 'unknown'},
];

function GotoSightingsPageButton() {
    return (<Button to={VIEW_SIGHTINGS_PAGE} appearance="primary" label="Go to Sightings"/>);
}

export function Form({existingSighting}) {
    const title = existingSighting ? "Edit Sighting" : "Create New Sighting";
    usePageTitle(title);

    const submissionSuccessModalTitle = existingSighting ? "Successfully Edited Sighting" : "Successfully Created New Sighting";
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_CONFIDENCE]: 100,
        }
    });
    const {register, setValue, handleSubmit, formState} = methods;

    register(FORM_FIELD_NAME, {required: "Name is required.", value: ""});
    register(FORM_FIELD_SIGHTING_CLASS, {required: "Sighting Class is required.", value: ""});
    register(FORM_FIELD_TLP_V2_RATING, FORM_FIELD_TLP_V2_RATING_OPTION);
    register(FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION);

    if (existingSighting) {
        register(FORM_FIELD_SIGHTING_ID, {required: "Sighting ID is required.", value: ""});
    }

    useEffect(() => {
        if (existingSighting) {
            setValue(FORM_FIELD_SIGHTING_ID, existingSighting.sighting_id);
            setValue(FORM_FIELD_SIGHTING_CLASS, existingSighting.sighting_class);
            setValue(FORM_FIELD_NAME, existingSighting.name);
            setValue(FORM_FIELD_TLP_V2_RATING, existingSighting.tlp_v2_rating);
            setValue(FIELD_CONFIDENCE, existingSighting.confidence);
        }
    }, [existingSighting, setValue]);

    const postEndpointFunction = existingSighting ? editSighting : postCreateSighting;
    const {submitSuccess, submissionError, onSubmit, submitButtonDisabled} = useOnFormSubmit({
        formMethods: methods,
        submitToPostEndpoint: postEndpointFunction,
        submissionSuccessCallback: (resp) => console.log(resp),
        submissionErrorCallback: (error) => {
            console.error(error)
        },
    })

    return (
        <FormProvider {...methods}>
            <MyForm onSubmit={handleSubmit(onSubmit)}>
                <PageHeadingContainer>
                    <PageHeading>{title}</PageHeading>
                </PageHeadingContainer>
                <section>
                    {submissionError && <Message appearance="fill" type="error">
                        {submissionError?.json?.error && <code>{submissionError.json.error}</code>}
                        {submissionError?.error && <code>{submissionError.error.toString()}</code>}
                    </Message>}
                    {existingSighting && <SightingIdField disabled fieldName={FORM_FIELD_SIGHTING_ID}/>}
                    <NameField fieldName={FORM_FIELD_NAME}/>
                    <SightingClassField fieldName={FORM_FIELD_SIGHTING_CLASS} options={SIGHTING_CLASSES}/>
                    <TLPv2RatingField fieldName={FORM_FIELD_TLP_V2_RATING}/>
                    <ConfidenceField fieldName={FIELD_CONFIDENCE}/>
                    <CustomControlGroup>
                        <HorizontalButtonLayout>
                            <SubmitButton inline disabled={submitButtonDisabled} submitting={formState.isSubmitting}
                                          label={existingSighting ? "Edit Sighting" : "Create Sighting"}/>
                        </HorizontalButtonLayout>
                    </CustomControlGroup>
                </section>
                <Modal open={submitSuccess}>
                    <Modal.Header
                        title={submissionSuccessModalTitle}
                    />
                    <Modal.Body>
                        <GotoSightingsPageButton/>
                    </Modal.Body>
                </Modal>
            </MyForm>
        </FormProvider>
    )
}

Form.propTypes = {
    existingSighting: PropTypes.object,
}

function EditModeForm({sightingId}) {
    const {record: sighting, loading, error} = useGetRecord({
        restGetFunction: getSighting,
        restFunctionQueryArgs: {sightingId}
    });
    return (
        <Loader error={error} loading={loading}>
            <Form existingSighting={sighting}/>
        </Loader>
    );
}

EditModeForm.propTypes = {
    sightingId: PropTypes.string.isRequired,
}

export default function SightingForm({editMode, sightingId}) {
    return editMode ? <EditModeForm sightingId={sightingId}/> : <Form/>;
}
SightingForm.propTypes = {
    editMode: PropTypes.bool,
    sightingId: PropTypes.string,
}
