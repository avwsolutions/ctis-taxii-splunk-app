import React from 'react';

import ExpandableDataTable from "@splunk/my-page/src/ExpandableDataTable";
import {deleteSighting, getSightings} from "@splunk/my-page/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-page/src/AppContainer";
import PaginatedDataTable from "@splunk/my-page/src/PaginatedDataTable";
import {editSightingPage, NEW_SIGHTING_PAGE} from "@splunk/my-page/src/urls";
import Plus from '@splunk/react-icons/Plus';
import DeleteModal from "@splunk/my-page/src/DeleteModal";
import useModal from "@splunk/my-page/src/useModal";
import {HorizontalActionButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import EditIconOnlyButton from "@splunk/my-page/src/buttons/EditIconOnlyButton";
import DeleteIconOnlyButton from "@splunk/my-page/src/buttons/DeleteIconOnlyButton";
import {SightingsSearchBar} from "@splunk/my-page/src/SearchBar";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-page/src/PageHeading";
import BaseButton from "@splunk/my-page/src/BaseButton";
import {formatTimestampForDisplay} from "@splunk/my-page/src/date_utils";
import {layoutWithTheme} from "../../common/theme";
import {getUrlQueryParams} from "../../common/queryParams";
import SightingForm from "../../common/SightingForm";
import {FIELD_LABEL_TLP_V2_MARKING} from "../../common/tlp";

function Actions({row}) {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (<HorizontalActionButtonLayout>
        <EditIconOnlyButton to={editSightingPage(row.sighting_id)}/>
        <DeleteIconOnlyButton onClick={handleRequestOpen}/>
        <DeleteModal open={open} onRequestClose={handleRequestClose}
                     deleteEndpointFunction={deleteSighting}
                     deleteEndpointArgs={{sightingId: row.sighting_id}}
                     modalBodyContent={<P>Are you sure you want to delete this
                         sighting: <strong>{row.name} ({row.sighting_id})</strong>?</P>}
        />
    </HorizontalActionButtonLayout>)
}

Actions.propTypes = {
    row: PropTypes.object.isRequired
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Sighting Class", getCellContent: (row) => row.sighting_class},
    {columnName: "Sighting ID", getCellContent: (row) => row.sighting_id},
]

const expansionFieldNameToCellValue = {
    "Name": (row) => row.name,
    "Sighting Class": (row) => row.sighting_class,
    "Sighting ID": (row) => row.sighting_id,
    [FIELD_LABEL_TLP_V2_MARKING]: row => row.tlp_v2_rating,
    "Confidence" : row => row.confidence,
    "Created At (UTC)": (row) => formatTimestampForDisplay(row.created),
    "Modified At (UTC)": (row) => formatTimestampForDisplay(row.modified),
}

function renderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.sighting_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}
                                       rowActionPrimary={Actions}
    />
    if (error) {
        return errorElement;
    }
    return loading ? loadingElement : table;
}

function ListSightings() {
    const [query, setQuery] = React.useState({});
    return (
        <>
            <PageHeadingContainer>
                <PageHeading level={1}>Sightings</PageHeading>
                <BaseButton inline icon={<Plus/>} label="New Sighting" appearance="primary" to={NEW_SIGHTING_PAGE}/>
            </PageHeadingContainer>
            <SightingsSearchBar onQueryChange={setQuery}/>
            <PaginatedDataTable renderData={renderDataTable} fetchData={getSightings} query={query} onError={(e) => {
                createErrorToast(e);
            }}/>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('action', 'edit') && queryParams.has('sighting_id')) {
        const sightingId = queryParams.get('sighting_id');
        return <SightingForm editMode sightingId={sightingId}/>
    }
    return (
        <ListSightings/>
    );

}

layoutWithTheme(
    <AppContainer>
        <Router/>
    </AppContainer>
);
