import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from "prop-types";
import {
    errorToText,
    getGrouping,
    getStixBundleForGrouping,
    getTaxiiConfigs,
    listTaxiiCollections,
    getTaxiiCollection,
    submitGrouping,
    useGetRecord
} from "@splunk/my-react-component/src/ApiClient";
import Loader from "@splunk/my-react-component/src/Loader";
import {FormProvider, useForm} from "react-hook-form";
import styled from "styled-components";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import CollapsiblePanel from "@splunk/react-ui/CollapsiblePanel";
import Code from '@splunk/react-ui/Code';
import Switch from "@splunk/react-ui/Switch";
import {dateToIsoStringWithoutTimezone} from "@splunk/my-react-component/src/date_utils";
import moment from "moment";
import {urlForViewSubmission} from "@splunk/my-react-component/src/urls";
import Message from "@splunk/react-ui/Message";
import {PageHeading, PageHeadingContainer} from "@splunk/my-react-component/PageHeading";
import P from "@splunk/react-ui/Paragraph";
import {isString} from "lodash";
import {useDebounce} from "@splunk/my-react-component/src/debounce";
import {GroupingId, ScheduledAt, TaxiiCollectionIdDropdown, TaxiiConfigField, TaxiiCollectionIdText} from "../../common/submission_form/fields";
import {usePageTitle} from "../../common/utils";

const FIELD_TAXII_CONFIG_NAME = 'taxii_config_name';
const FIELD_TAXII_COLLECTION_ID = 'taxii_collection_id';
const FIELD_GROUPING_ID = 'grouping_id';
const FIELD_SCHEDULED_AT = 'scheduled_at';
const WARNING_TAXII_COLLECTION_DISCOVERY_DISABLED = "Warning: Collection Discovery is disabled for this configuration.";

const StyledForm = styled.form`
    max-width: 1000px;
`;
const SwitchContainer = styled.div`
    flex-grow: 0;
    min-width: fit-content;
    max-width: 30%;
`

function collectionToOption(collection) {
    let label = `${collection.title} (${collection.id})`;
    if (collection.can_write === false) {
        label += " [Cannot Write]";
    }
    return {
        label,
        value: collection.id,
        disabled: collection.can_write === false
    }
}

function useTaxiiCollectionsOptions({selectedTaxiiConfig, defaultCollectionId, shouldDiscoverCollections}) {
    if(typeof shouldDiscoverCollections !== 'boolean'){
        throw new Error("Expected shouldDiscoverCollections to be a boolean");
    }
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        console.log("Selected TAXII Config:", selectedTaxiiConfig, "Default Collection ID:", defaultCollectionId, "Should Discover Collections:", shouldDiscoverCollections);
        if(selectedTaxiiConfig && shouldDiscoverCollections) {
            setLoading(true);
            listTaxiiCollections({
                taxiiConfigName: selectedTaxiiConfig,
                successHandler: (resp) => {
                    console.log("Collections:", resp);
                    const options = resp.collections.map(collection => collectionToOption(collection));
                    setCollectionOptions(options);
                    setLoading(false);
                },
                errorHandler: async (errorResponse) => {
                    const errorText = await errorResponse.text()
                    const errMessage = `Error getting TAXII collections: ${errorText}`;
                    console.error(errMessage, errorResponse);
                    setLoading(false);
                    setError(errMessage);
                }
            }).then();
        }
        if(!shouldDiscoverCollections && isString(defaultCollectionId)) {
            setCollectionOptions([{
                label: `Default Collection (${defaultCollectionId})`,
                value: defaultCollectionId,
                disabled: false
            }]);
        }
    }, [selectedTaxiiConfig, defaultCollectionId, shouldDiscoverCollections]);
    return {collectionOptions, loading, error};
}

function extractShouldDiscoverCollectionsFromConfig(taxiiConfigContent) {
    if (taxiiConfigContent && "should_discover_collections" in taxiiConfigContent){
        return taxiiConfigContent.should_discover_collections === '1';
    }
    // if should_discover_collections is not present, default to true for backwards compatibility
    return true;
}

export function Form({groupingId}) {
    const title = "Submit Grouping";
    usePageTitle(title);

    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_TAXII_CONFIG_NAME]: null,
            [FIELD_TAXII_COLLECTION_ID]: null,
            [FIELD_GROUPING_ID]: groupingId,
            [FIELD_SCHEDULED_AT]: null,
        }
    });
    const {watch, register, trigger, handleSubmit, formState, setValue, clearErrors, setError} = methods;

    const {loading: loadingGrouping, error: groupingError} = useGetRecord({
        restGetFunction: getGrouping,
        restFunctionQueryArgs: {groupingId}
    });

    const {loading: loadingTaxiiConfigs, record: taxiiConfig, error: taxiiConfigError} = useGetRecord({
        restGetFunction: getTaxiiConfigs,
        restFunctionQueryArgs: {}
    })

    const {loading: bundleLoading, record: bundle, error: bundleError} = useGetRecord({
        restGetFunction: getStixBundleForGrouping,
        restFunctionQueryArgs: {groupingId}
    });
    const bundleJsonString = JSON.stringify(bundle?.bundle, null, 4);

    const loading = loadingGrouping || bundleLoading || loadingTaxiiConfigs;
    const taxiiConfigEntries = taxiiConfig?.entry || [];
    const taxiiConfigOptions = taxiiConfigEntries.map(entry => ({
        label: `${entry.name} (${entry.content.api_root_url})`,
        value: entry.name
    }));
    const taxiiConfigNameToContent = Object.fromEntries(taxiiConfigEntries.map(entry => [entry.name, entry.content]))

    register(FIELD_GROUPING_ID, {required: 'Grouping ID is required'});
    register(FIELD_TAXII_CONFIG_NAME, {required: 'TAXII Config is required'});
    register(FIELD_TAXII_COLLECTION_ID, {
        required: 'TAXII Collection is required'
    });
    const formCollectionId = watch(FIELD_TAXII_COLLECTION_ID);
    const debouncedCollectionId = useDebounce(formCollectionId, 500);

    const [scheduledSubmission, setScheduledSubmission] = useState(false);
    const submitButtonLabel = scheduledSubmission ? "Schedule Submission" : "Submit Now";

    register(FIELD_SCHEDULED_AT, {
        validate:
            (value) => {
                if (scheduledSubmission) {
                    if (!value) {
                        return `Scheduled At is required`;
                    }
                    const now = moment();
                    const dateValue = moment.utc(value);
                    if (dateValue < now) {
                        return `Scheduled At must be in the future`;
                    }
                }
                return null;
            }
    });

    const selectedTaxiiConfig = watch(FIELD_TAXII_CONFIG_NAME);
    const selectedTaxiiConfigContent = taxiiConfigNameToContent[selectedTaxiiConfig];
    const shouldDiscoverTaxiiCollections = extractShouldDiscoverCollectionsFromConfig(selectedTaxiiConfigContent);

    const defaultCollectionId = selectedTaxiiConfigContent?.default_collection_id;
    const selectedDefaultCollectionId = isString(defaultCollectionId) && defaultCollectionId !== "" ? defaultCollectionId : null;


    const {
        loading: collectionOptionsLoading,
        collectionOptions,
        error: taxiiCollectionsError,
    } = useTaxiiCollectionsOptions({selectedTaxiiConfig, defaultCollectionId: selectedDefaultCollectionId, shouldDiscoverCollections: shouldDiscoverTaxiiCollections});

    useEffect(() => {
        setValue(FIELD_TAXII_COLLECTION_ID, selectedDefaultCollectionId, {shouldValidate: true});
    }, [selectedDefaultCollectionId, collectionOptions, setValue]);

    const error = groupingError || bundleError || taxiiConfigError;

    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);

    const [submissionError, setSubmissionError] = useState(null);

    const onSubmit = async (data) => {
        console.log("Form data:", data);
        const formIsValid = await trigger();
        if (formIsValid) {
            console.log("Form is valid");
            await submitGrouping(data, (resp) => {
                console.log(resp);
                setSubmitSuccess(true);
                window.location = urlForViewSubmission(resp.submission.submission_id);
            }, (errorResponse) => {
                console.error("Error submitting grouping", errorResponse);
                errorToText(errorResponse).then(
                    errorText => {
                        setSubmissionError(errorText);
                    }
                );
            });
        } else {
            console.log("Form is not valid");
            console.error(formState.errors);
        }
    }

    const handleScheduleSwitchOnClick = () => {
        setScheduledSubmission(v => !v);
    }
    useEffect(() => {
        if (scheduledSubmission) {
            const dateInFuture = moment().add(1, 'days').startOf('minute').toDate();
            setValue(FIELD_SCHEDULED_AT, dateToIsoStringWithoutTimezone(dateInFuture), {shouldValidate: true});
        } else {
            setValue(FIELD_SCHEDULED_AT, null, {shouldValidate: true});
        }
    }, [scheduledSubmission, setValue]);

    useEffect(() => {
        console.log(`Collection ID: ${debouncedCollectionId}, Should Discover Collections: ${shouldDiscoverTaxiiCollections}`);
        if(!shouldDiscoverTaxiiCollections && !debouncedCollectionId) {
            setError(FIELD_TAXII_COLLECTION_ID, {message: 'TAXII Collection is required'});
        }else if(!shouldDiscoverTaxiiCollections && debouncedCollectionId) {
            getTaxiiCollection({
                taxiiConfigName: selectedTaxiiConfig,
                collectionId: debouncedCollectionId,
                successHandler: (resp) => {
                    console.log("Collection Info:", resp);
                    if(resp?.can_write === true) {
                        clearErrors(FIELD_TAXII_COLLECTION_ID);
                    }else{
                        setError(FIELD_TAXII_COLLECTION_ID, {message: `Credential does not have can_write permission on Collection ${debouncedCollectionId}`});
                    }
                },
                errorHandler: async (errorResponse) => {
                    const errMessage = `Error getting collection info for collection ${debouncedCollectionId}: ${errorResponse.status} ${errorResponse.statusText}`
                    console.error(await errorResponse.text());
                    setError(FIELD_TAXII_COLLECTION_ID, {message: errMessage});
                }
            }).then();
        }else if(shouldDiscoverTaxiiCollections){
            clearErrors(FIELD_TAXII_COLLECTION_ID);
        }
    }, [debouncedCollectionId, shouldDiscoverTaxiiCollections, selectedTaxiiConfig, clearErrors, setError]);

    return (
        <FormProvider {...methods}>
            <StyledForm name="SubmitGrouping" onSubmit={handleSubmit(onSubmit)}>
                <PageHeadingContainer>
                    <PageHeading level={1}>{title}</PageHeading>
                </PageHeadingContainer>
                <P>Submit Grouping as STIX Bundle to TAXII Server</P>
                <Loader error={error} loading={loading}>
                    {submissionError && <Message appearance="fill" type="error">
                        Error: {JSON.stringify(submissionError)}
                    </Message>}
                    <section>
                        <GroupingId fieldName={FIELD_GROUPING_ID}/>
                        <TaxiiConfigField fieldName={FIELD_TAXII_CONFIG_NAME} options={taxiiConfigOptions}/>
                        {/* <Code language="json" value={JSON.stringify(selectedTaxiiConfigContent, null, 4)}/> */}

                        {shouldDiscoverTaxiiCollections && <TaxiiCollectionIdDropdown loading={collectionOptionsLoading}
                                                                                      disabled={selectedTaxiiConfig === null}
                                                                                      fieldName={FIELD_TAXII_COLLECTION_ID}
                                                                                      options={collectionOptions}
                                                                                      error={taxiiCollectionsError}/>}
                        {!shouldDiscoverTaxiiCollections && <TaxiiCollectionIdText fieldName={FIELD_TAXII_COLLECTION_ID}/>}
                        <CustomControlGroup label="Scheduled?">
                            <SwitchContainer>
                                <Switch
                                    key="scheduleSubmissionSwitch"
                                    onClick={handleScheduleSwitchOnClick}
                                    selected={scheduledSubmission}
                                    appearance="toggle"
                                >{scheduledSubmission ? "Schedule for later" : "Will submit immediately"}</Switch>
                            </SwitchContainer>
                        </CustomControlGroup>
                        {scheduledSubmission && <ScheduledAt fieldName={FIELD_SCHEDULED_AT}/>}
                    </section>
                    <CustomControlGroup>
                        <HorizontalButtonLayout>
                            <SubmitButton label={submitButtonLabel} disabled={submitButtonDisabled}
                                          submitting={formState.isSubmitting}/>
                        </HorizontalButtonLayout>
                    </CustomControlGroup>
                    <section>
                        <CollapsiblePanel title="Preview of STIX Bundle JSON">
                            <Code language="json" value={bundleJsonString}/>
                        </CollapsiblePanel>
                    </section>
                </Loader>
            </StyledForm>
        </FormProvider>
    );
}

Form.propTypes = {
    groupingId: PropTypes.string.isRequired
}

