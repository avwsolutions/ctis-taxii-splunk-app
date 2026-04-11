import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useForm} from "react-hook-form"
import Heading from "@splunk/react-ui/Heading";
import {useDispatch, useSelector} from 'react-redux'
import PropTypes from "prop-types";

import DeleteButton from "@splunk/my-page/src/DeleteButton";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {CustomControlGroup} from "@splunk/my-page/src/CustomControlGroup";
import Switch from "@splunk/react-ui/Switch";
import Divider from "@splunk/react-ui/Divider";
import styled from "styled-components";
import {variables} from "@splunk/themes";
import {
    SightingCategoryField,
    SightingDescriptionField,
    SightingNameField,
    SightingValueField,
    SplunkFieldNameDropdown,
    StixPatternField
} from "../../common/sighting_form/formControls";
import {
    FIELD_SIGHTING_CATEGORY,
    FIELD_SIGHTING_DESCRIPTION,
    FIELD_SIGHTING_NAME,
    FIELD_SIGHTING_VALUE,
    FIELD_SPLUNK_FIELD_NAME,
    FIELD_STIX_PATTERN,
    REGISTER_FIELD_OPTIONS
} from "../../common/sighting_form/fieldNames";
import {useRespondToValidationSignal} from "./formUtils";
import {getValidationSignal, submitData, validationDone} from './Sightings.slice'
import {usePatternSuggester} from "./patternSuggester";

const HorizontalLayout = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${variables.spacingLarge} 0;
`
const StyledHeading = styled(Heading)`
    margin: 0;
    flex-grow: 1;
`;
const StyledSection = styled.section`
    margin-bottom: ${variables.spacingMedium};
`;
const FORM_FIELDS = [FIELD_SPLUNK_FIELD_NAME, FIELD_SIGHTING_VALUE, FIELD_SIGHTING_CATEGORY, FIELD_STIX_PATTERN, FIELD_SIGHTING_NAME, FIELD_SIGHTING_DESCRIPTION];

const SightingSubForm = ({
                              id,
                              index,
                              removeSelf,
                              removeSelfEnabled,
                              submissionErrors,
                              splunkEvent,
                              sightingCategories
                          }) => {
    const formMethods = useForm({
        mode: 'all',
        defaultValues: useSelector(state => state.sightings.sightings[id]) || {}
    })
    const {register, handleSubmit, formState: {errors}, watch, trigger, setValue} = formMethods;

    FORM_FIELDS.forEach(fieldName => {
        register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]);
    });

    const splunkFields = Object.keys(splunkEvent || {});
    const dispatch = useDispatch();
    const validationSignal = useSelector(getValidationSignal);

    const splunkFieldName = watch(FIELD_SPLUNK_FIELD_NAME);
    const sightingValue = watch(FIELD_SIGHTING_VALUE);
    const sightingCategory = watch(FIELD_SIGHTING_CATEGORY);
    const stixPattern = watch(FIELD_STIX_PATTERN);
    const sightingName = watch(FIELD_SIGHTING_NAME);
    const sightingDescription = watch(FIELD_SIGHTING_DESCRIPTION);

    const formValues = useMemo(() => ({
        [FIELD_SPLUNK_FIELD_NAME]: splunkFieldName,
        [FIELD_SIGHTING_VALUE]: sightingValue,
        [FIELD_SIGHTING_CATEGORY]: sightingCategory,
        [FIELD_STIX_PATTERN]: stixPattern,
        [FIELD_SIGHTING_NAME]: sightingName,
        [FIELD_SIGHTING_DESCRIPTION]: sightingDescription
    }), [
        splunkFieldName,
        sightingValue,
        sightingCategory,
        stixPattern,
        sightingName,
        sightingDescription
    ]);

    const {suggestedPattern, error: patternApiError} = usePatternSuggester(sightingCategory, sightingValue);

    const splunkFieldDropdownOptions = splunkFields.map(splunkField => ({
        label: `${splunkField} (${splunkEvent[splunkField]})`,
        value: splunkField
    }));
    const [toggleShowSplunkFieldDropdown, setToggleShowSplunkFieldDropdown] = useState(true);

    useEffect(() => {
        if (splunkEvent) {
            // https://stackoverflow.com/a/455340/23523267
            if (Object.prototype.hasOwnProperty.call(splunkEvent, splunkFieldName) && toggleShowSplunkFieldDropdown) {
                setValue(FIELD_SIGHTING_VALUE, splunkEvent[splunkFieldName], {shouldValidate: true});
            }
        }
    }, [setValue, splunkEvent, splunkFieldName, toggleShowSplunkFieldDropdown]);

    // When suggested pattern changes, update the STIX pattern field with new pattern
    useEffect(() => {
        if (suggestedPattern) {
            setValue(FIELD_STIX_PATTERN, suggestedPattern, {shouldValidate: true});
        }
    }, [setValue, suggestedPattern]);

    // Propagate form values to store
    useEffect(() => {
        dispatch(submitData({
            id,
            data: formValues
        }));
    }, [id, dispatch, formValues]);

    useRespondToValidationSignal({
        validationSignal,
        formErrors: errors,
        trigger,
        validationDoneActionCreator: ({...args}) => validationDone({...args, id})
    });
    const onSubmit = (data) => console.log(data);

    return (
        <StyledSection>
            <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <HorizontalLayout>
                        <StyledHeading level={2}>New Sighting {`#${index + 1}`}</StyledHeading>
                        {removeSelfEnabled && <DeleteButton inline label="Remove" onClick={() => removeSelf()}/>}
                    </HorizontalLayout>
                    {submissionErrors?.length > 0 && <Message appearance="fill" type="error">
                        {submissionErrors.map(error => <P>{error}</P>)}
                    </Message>}
                    {splunkEvent &&
                        <CustomControlGroup label="Use Splunk Field?">
                            <Switch
                                key="toggleShowSplunkFieldDropdown"
                                onClick={() => setToggleShowSplunkFieldDropdown(!toggleShowSplunkFieldDropdown)}
                                selected={toggleShowSplunkFieldDropdown}
                                appearance="toggle"
                            />
                        </CustomControlGroup>
                    }
                    {splunkEvent && toggleShowSplunkFieldDropdown &&
                        <SplunkFieldNameDropdown fieldName={FIELD_SPLUNK_FIELD_NAME}
                                                 options={splunkFieldDropdownOptions}/>
                    }
                    {
                        (!splunkEvent || !toggleShowSplunkFieldDropdown) &&
                        <SightingValueField fieldName={FIELD_SIGHTING_VALUE}/>
                    }
                    <SightingCategoryField options={sightingCategories} fieldName={FIELD_SIGHTING_CATEGORY}/>
                    <StixPatternField suggestedPattern={suggestedPattern} fieldName={FIELD_STIX_PATTERN}
                                      patternApiError={patternApiError}/>
                    <SightingNameField fieldName={FIELD_SIGHTING_NAME}/>
                    <SightingDescriptionField fieldName={FIELD_SIGHTING_DESCRIPTION}/>
                    <Divider/>
                </form>
            </FormProvider>
        </StyledSection>
    );
};

SightingSubForm.propTypes = {
    index: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    removeSelf: PropTypes.func,
    removeSelfEnabled: PropTypes.bool,
    submissionErrors: PropTypes.array,
    splunkEvent: PropTypes.object,
    sightingCategories: PropTypes.array,
};

export default SightingSubForm;
