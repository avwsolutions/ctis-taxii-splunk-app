import React, {useEffect} from "react";
import {editSighting, getSighting, useGetRecord} from "@splunk/my-page/src/ApiClient";
import {FormProvider, useForm} from "react-hook-form";
import Loader from "@splunk/my-page/src/Loader";
import {reduceIsoStringPrecisionToSeconds} from "@splunk/my-page/src/date_utils";
import {HorizontalButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import DeleteButton from "@splunk/my-page/src/DeleteButton";
import {CustomControlGroup} from "@splunk/my-page/src/CustomControlGroup";
import EditButton from "@splunk/my-page/src/EditButton";
import {urlForEditSighting, viewSighting} from "@splunk/my-page/src/urls";
import SubmitButton from "@splunk/my-page/src/SubmitButton";
import CancelButton from "@splunk/my-page/src/CancelButton";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {DeleteSightingModal} from "@splunk/my-page/src/DeleteModal";
import useModal from "@splunk/my-page/src/useModal";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-page/src/PageHeading";
import {useOnFormSubmit} from "../formSubmit";
import {usePatternSuggester} from "../../pages/new_sighting/patternSuggester";
import useSightingCategories from "./sightingCategories";
import {
    SightingCategoryField,
    SightingDescriptionField,
    SightingIdField,
    SightingNameField,
    SightingValueField,
    StixPatternField,
    ValidFromField
} from "./formControls";
import {StyledForm} from "./StyledForm";
import {
    FIELD_CONFIDENCE,
    FIELD_GROUPING_ID,
    FIELD_SIGHTING_CATEGORY,
    FIELD_SIGHTING_DESCRIPTION,
    FIELD_SIGHTING_ID,
    FIELD_SIGHTING_NAME,
    FIELD_SIGHTING_VALUE,
    FIELD_STIX_PATTERN,
    FIELD_TLP_RATING,
    FIELD_VALID_FROM,
    REGISTER_FIELD_OPTIONS
} from "./fieldNames";
import {GroupingIdFieldV2} from "./GroupingsDropdown";
import {usePageTitle} from "../utils";
import {TLPv2RatingField} from "../tlp";
import {ConfidenceField} from "../confidence";

const FORM_FIELD_NAMES = [FIELD_SIGHTING_ID,
    FIELD_GROUPING_ID, FIELD_TLP_RATING, FIELD_CONFIDENCE, FIELD_VALID_FROM,
    FIELD_SIGHTING_CATEGORY, FIELD_SIGHTING_VALUE,
    FIELD_STIX_PATTERN, FIELD_SIGHTING_NAME, FIELD_SIGHTING_DESCRIPTION];

const ButtonsForViewMode = ({sighting}) => {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return <HorizontalButtonLayout justifyContent='space-between'>
        <DeleteButton inline onClick={handleRequestOpen}/>
        <EditButton inline to={urlForEditSighting(sighting.sighting_id)}/>
        <DeleteSightingModal open={open} onRequestClose={handleRequestClose} sighting={sighting}/>
    </HorizontalButtonLayout>;
}
ButtonsForViewMode.propTypes = {
    sighting: PropTypes.object.isRequired
}

const ButtonsForEditMode = ({submitting, submitButtonDisabled}) => {
    return <HorizontalButtonLayout>
        <CancelButton/>
        <SubmitButton label="Save Changes" disabled={submitButtonDisabled} submitting={submitting}/>
    </HorizontalButtonLayout>;
}
ButtonsForEditMode.propTypes = {
    submitting: PropTypes.bool.isRequired,
    submitButtonDisabled: PropTypes.bool.isRequired
}

export default function ViewOrEditSighting({sightingId, editMode}) {
    const title = editMode ? `Edit Sighting` : `Sighting (${sightingId})`;
    const readOnly = !editMode;

    usePageTitle(title);

    const {record, loading, error} = useGetRecord({
        restGetFunction: getSighting,
        restFunctionQueryArgs: {sightingId},
    })

    const methods = useForm({
        mode: 'all',
    })
    const {watch, register, formState, handleSubmit, setValue} = methods;
    FORM_FIELD_NAMES.forEach(fieldName => register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]));

    const {onSubmit, submitSuccess, submissionError, submitButtonDisabled} = useOnFormSubmit({
        formMethods: methods,
        submitToPostEndpoint: editSighting,
        submissionSuccessCallback: (resp) => console.log(resp),
        submissionErrorCallback: (callbackError) => console.error(callbackError),
    })

    useEffect(() => {
        if (submitSuccess) {
            window.location = viewSighting(sightingId);
        }
    }, [sightingId, submitSuccess]);

    useEffect(() => {
        if (record) {
            setValue(FIELD_SIGHTING_ID, record.sighting_id);
            setValue(FIELD_GROUPING_ID, record.grouping_id);
            setValue(FIELD_SIGHTING_NAME, record.name);
            setValue(FIELD_SIGHTING_DESCRIPTION, record.description);
            setValue(FIELD_STIX_PATTERN, record.stix_pattern);
            setValue(FIELD_SIGHTING_VALUE, record.sighting_value);
            setValue(FIELD_SIGHTING_CATEGORY, record.sighting_category);
            setValue(FIELD_VALID_FROM, reduceIsoStringPrecisionToSeconds(record.valid_from));
            setValue(FIELD_CONFIDENCE, record.confidence);
            setValue(FIELD_TLP_RATING, record.tlp_v2_rating);
        }
    }, [setValue, record]);

    const {sightingCategories} = useSightingCategories();
    const sightingCategory = watch(FIELD_SIGHTING_CATEGORY);
    const sightingValue = watch(FIELD_SIGHTING_VALUE);
    const {suggestedPattern, error: patternApiError} = usePatternSuggester(sightingCategory, sightingValue);

    useEffect(() => {
        if(suggestedPattern){
            setValue(FIELD_STIX_PATTERN, suggestedPattern, {shouldValidate: true});
        }
    }, [setValue, suggestedPattern]);

    return (<div>
        <PageHeadingContainer>
            <PageHeading>{title}</PageHeading>
        </PageHeadingContainer>
        <Loader loading={loading} error={error}>
            <FormProvider {...methods}>
                <StyledForm onSubmit={handleSubmit(onSubmit)}>
                    {submissionError?.json?.errors && <Message appearance="fill" type="error">
                        <div>
                            <P>Form submission error</P>
                            {submissionError.json.errors.map(submissionErrorToDisplay =>
                                <P>{submissionErrorToDisplay}</P>)}
                        </div>
                    </Message>}
                    <section>
                        <SightingIdField fieldName={FIELD_SIGHTING_ID} readOnly={readOnly} disabled/>
                        <GroupingIdFieldV2 fieldName={FIELD_GROUPING_ID} readOnly={readOnly}/>
                        <SightingNameField fieldName={FIELD_SIGHTING_NAME} readOnly={readOnly}/>
                        <SightingDescriptionField fieldName={FIELD_SIGHTING_DESCRIPTION} readOnly={readOnly}/>
                        <ConfidenceField fieldName={FIELD_CONFIDENCE} readOnly={readOnly}/>
                        <TLPv2RatingField fieldName={FIELD_TLP_RATING} readOnly={readOnly}/>
                        <ValidFromField fieldName={FIELD_VALID_FROM} readOnly={readOnly}/>
                        <SightingValueField fieldName={FIELD_SIGHTING_VALUE} readOnly={readOnly}/>
                        <SightingCategoryField fieldName={FIELD_SIGHTING_CATEGORY} options={sightingCategories}
                                                readOnly={readOnly}/>
                        <StixPatternField suggestedPattern={suggestedPattern}
                                          fieldName={FIELD_STIX_PATTERN}
                                          patternApiError={patternApiError}
                                          readOnly={readOnly}/>
                    </section>
                    <section>
                        <CustomControlGroup>
                            {!editMode && <ButtonsForViewMode sighting={record}/>}
                            {editMode && <ButtonsForEditMode submitting={formState.isSubmitting}
                                                             submitButtonDisabled={submitButtonDisabled}/>}
                        </CustomControlGroup>
                    </section>

                </StyledForm>
            </FormProvider>
        </Loader>
    </div>)

}
ViewOrEditSighting.propTypes = {
    sightingId: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
}
