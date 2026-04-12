import React from 'react';
import SelectControlGroup from "@splunk/my-page/src/SelectControlGroup";
import DatetimeControlGroup from "@splunk/my-page/src/DateTimeControlGroup";
import TextControlGroup from "@splunk/my-page/src/TextControlGroup";
import StixPatternControlGroup from "@splunk/my-page/src/StixPatternControlGroup";
import TextAreaControlGroup from "@splunk/my-page/src/TextAreaControlGroup";
import PropTypes from "prop-types";
import {useFormInputProps} from "../formInputProps";

export function SightingIdField({fieldName, ...props}) {
    return <TextControlGroup label="Sighting ID" {...useFormInputProps(fieldName)} {...props}/>
}

SightingIdField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function SplunkFieldNameDropdown({fieldName, options, ...props}) {
    return <SelectControlGroup label="Splunk Field" options={options}
                               {...useFormInputProps(fieldName)}
                               {...props}/>
}

SplunkFieldNameDropdown.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}


export function ValidFromField({fieldName, ...props}) {
    return <DatetimeControlGroup label="Valid From (UTC)" setHelpTextAsRelativeTime {...useFormInputProps(fieldName)} {...props}/>
}

ValidFromField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function SightingValueField({fieldName, ...props}) {
    return <TextControlGroup label="Sighting Value" {...useFormInputProps(fieldName)} {...props} />
}

SightingValueField.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function SightingCategoryField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Sighting Category"
                               options={options}
                               {...useFormInputProps(fieldName)}
                               {...props}/>
}

SightingCategoryField.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
}

export function StixPatternField({suggestedPattern, fieldName, patternApiError, ...props}) {
    const formInputProps = useFormInputProps(fieldName);
    const {onChange: formInputPropsOnChange} = formInputProps;
    return <StixPatternControlGroup label="STIX Pattern"
                                    {...formInputProps}
                                    suggestedPattern={suggestedPattern}
                                    setValueToSuggestedPattern={() => formInputPropsOnChange(null, {value: suggestedPattern})}
                                    patternApiError={patternApiError}
                                    {...props}
    />;
}

StixPatternField.propTypes = {
    suggestedPattern: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    error: PropTypes.string,
    patternApiError: PropTypes.string,
}

export function SightingNameField({fieldName, ...props}) {
    return <TextControlGroup label="Sighting Name" {...props} {...useFormInputProps(fieldName)
    }/>
}

SightingNameField.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function SightingDescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup
        label="Sighting Description" {...props} {...useFormInputProps(fieldName)}/>
}

SightingDescriptionField.propTypes = {
    fieldName: PropTypes.string.isRequired,
}
