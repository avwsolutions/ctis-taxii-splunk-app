import {FormProvider, useForm} from "react-hook-form";
import React, {useCallback, useEffect, useState} from "react";
import Heading from "@splunk/react-ui/Heading";
import Divider from "@splunk/react-ui/Divider";
import styled from "styled-components";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {variables} from '@splunk/themes';
import Switch from "@splunk/react-ui/Switch";
import {CustomControlGroup} from "@splunk/my-page/src/CustomControlGroup";
import DeleteButton from "@splunk/my-page/src/DeleteButton";
import PropTypes from "prop-types";
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

export const SightingSubForm = ({
                                     id,
                                     index,
                                     updateSighting,
                                     splunkEvent,
                                     sightingCategories,
                                     removeSelf,
                                     submissionErrors,
                                     validationSignal,
                                     onValidationError
                                 }) => {
    const formMethods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_SPLUNK_FIELD_NAME]: '',
            [FIELD_SIGHTING_VALUE]: '',
            [FIELD_SIGHTING_CATEGORY]: '',
            [FIELD_STIX_PATTERN]: '',
            [FIELD_SIGHTING_NAME]: '',
            [FIELD_SIGHTING_DESCRIPTION]: ''
        }
    });
    const {register, watch, setValue, getValues, trigger, formState} = formMethods;
    const splunkFields = Object.keys(splunkEvent || {});

    [FIELD_SPLUNK_FIELD_NAME, FIELD_SIGHTING_VALUE, FIELD_SIGHTING_CATEGORY,
        FIELD_STIX_PATTERN, FIELD_SIGHTING_NAME, FIELD_SIGHTING_DESCRIPTION].forEach(fieldToRegister => {
        register(fieldToRegister, REGISTER_FIELD_OPTIONS[fieldToRegister]);
    });

    const splunkFieldName = watch(FIELD_SPLUNK_FIELD_NAME);
    const sightingValue = watch(FIELD_SIGHTING_VALUE);
    const sightingCategory = watch(FIELD_SIGHTING_CATEGORY);
    const stixPattern = watch(FIELD_STIX_PATTERN);
    const sightingName = watch(FIELD_SIGHTING_NAME);
    const sightingDescription = watch(FIELD_SIGHTING_DESCRIPTION);

    const {suggestedPattern, error: patternApiError} = usePatternSuggester(sightingCategory, sightingValue);

    const indexStartingAtOne = index + 1;
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

    const updateSightingWithFormValues = useCallback(() => {
        console.log("Updating sighting with form values");
        updateSighting(getValues());
    }, [updateSighting, getValues]);

    // When suggested pattern changes, update the STIX pattern field with new pattern
    useEffect(() => {
        if (suggestedPattern) {
            setValue(FIELD_STIX_PATTERN, suggestedPattern, {shouldValidate: true});
        }
    }, [setValue, suggestedPattern]);

    useEffect(() => {
        updateSightingWithFormValues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [splunkFieldName, sightingValue, sightingCategory, stixPattern, sightingName, sightingDescription]);

    const [onValidationErrorPromise, setOnValidationErrorPromise] = useState(null);
    useEffect(() => {
        if (onValidationErrorPromise) {
            const {errors} = formState;
            onValidationErrorPromise.resolve(errors);
            setOnValidationErrorPromise(null);
        }
    }, [onValidationErrorPromise, setOnValidationErrorPromise, formState]);

    const performValidation = useCallback(async () => {
        if (onValidationError) {
            await trigger();
            console.log(`Validation complete for sighting ${id}`);
            return new Promise((resolve) => {
                setOnValidationErrorPromise({resolve});
            }).then(x => onValidationError(x));
        }
        return null;
    }, [onValidationError, trigger, id, setOnValidationErrorPromise]);

    const [lastValidationSignal, setLastValidationSignal] = useState(null);
    useEffect(() => {
        if (validationSignal > 0 && validationSignal !== lastValidationSignal) {
            setLastValidationSignal(validationSignal);
            performValidation().then();
        }
    }, [validationSignal, performValidation, lastValidationSignal]);

    return <StyledSection key={id}>
        <FormProvider {...formMethods}>
            <HorizontalLayout>
                <StyledHeading level={2}>New Sighting {`#${indexStartingAtOne}`}</StyledHeading>
                <DeleteButton inline label="Remove" onClick={() => removeSelf()}/>
            </HorizontalLayout>
            {submissionErrors && <Message appearance="fill" type="error">
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
                <SplunkFieldNameDropdown fieldName={FIELD_SPLUNK_FIELD_NAME} options={splunkFieldDropdownOptions}/>
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
        </FormProvider>
    </StyledSection>
}

SightingSubForm.propTypes = {
    id: PropTypes.string,
    index: PropTypes.number,
    updateSighting: PropTypes.func,
    splunkEvent: PropTypes.object,
    sightingCategories: PropTypes.array,
    removeSelf: PropTypes.func,
    submissionErrors: PropTypes.array,
    validationSignal: PropTypes.number,
    onValidationError: PropTypes.func
}
