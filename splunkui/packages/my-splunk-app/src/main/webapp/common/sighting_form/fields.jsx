import SelectControlGroup from "@splunk/my-page/src/SelectControlGroup";
import React from "react";
import TextControlGroup from "@splunk/my-page/src/TextControlGroup";
import PropTypes from "prop-types";
import {useFormInputProps} from "../formInputProps";

export function SightingIdField({fieldName, ...props}) {
    return <TextControlGroup label="Sighting ID" {...useFormInputProps(fieldName)} {...props}/>
}

SightingIdField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function NameField({fieldName, ...props}) {
    return <TextControlGroup label="Name" {...useFormInputProps(fieldName)} {...props}/>
}

NameField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function SightingClassField({fieldName, options, ...props}) {
    return <SelectControlGroup label="Sighting Class" {...useFormInputProps(fieldName)} options={options} {...props}/>
}

SightingClassField.propTypes = {
    fieldName: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
}
