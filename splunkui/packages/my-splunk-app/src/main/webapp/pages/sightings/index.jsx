import React, {useEffect} from 'react';

import ExpandableDataTable from "@splunk/my-page/src/ExpandableDataTable";
import {SightingsSearchBar} from "@splunk/my-page/src/SearchBar";
import Plus from '@splunk/react-icons/Plus';
import {getSightings} from "@splunk/my-page/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-page/src/AppContainer";
import PaginatedDataTable from "@splunk/my-page/src/PaginatedDataTable";
import {
    GroupingIdLink,
    SightingIdLink,
    NEW_SIGHTING_PAGE,
    urlForEditSighting
} from "@splunk/my-page/src/urls";
import useModal from "@splunk/my-page/src/useModal";
import {DeleteSightingModal} from "@splunk/my-page/src/DeleteModal";
import {useViewportBreakpoints} from "@splunk/my-page/src/viewportBreakpoints";
import EditIconOnlyButton from "@splunk/my-page/src/buttons/EditIconOnlyButton";
import DeleteIconOnlyButton from "@splunk/my-page/src/buttons/DeleteIconOnlyButton";
import {HorizontalActionButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-page/src/PageHeading";
import BaseButton from "@splunk/my-page/src/BaseButton";
import {formatTimestampForDisplay} from "@splunk/my-page/src/date_utils";
import {layoutWithTheme} from "../../common/theme";
import ViewOrEditSighting from "../../common/sighting_form/ViewOrEditSighting";
import {getUrlQueryParams} from "../../common/queryParams";
import {usePageTitle} from "../../common/utils";
import {FIELD_LABEL_TLP_V2_MARKING} from "../../common/tlp";

const mappingOfColumnNameToCellValue = [
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "STIX Pattern", getCellContent: (row) => row.stix_pattern},
    {columnName: "Sighting ID", getCellContent: (row) => <SightingIdLink sightingId={row.sighting_id}/>},
    {columnName: "Grouping ID", getCellContent: (row) => <GroupingIdLink groupingId={row.grouping_id}/>},
]

const expansionFieldNameToCellValue = {
    "Sighting ID": (row) => <SightingIdLink sightingId={row.sighting_id}/>,
    "Grouping ID": (row) => <GroupingIdLink groupingId={row.grouping_id}/>,
    "Name": (row) => row.name,
    "Description": (row) => row?.description || "No description provided",
    "STIX Pattern": (row) => row.stix_pattern,
    "Valid From (UTC)": (row) => formatTimestampForDisplay(row.valid_from),
    "Sighting Category": (row) => row.sighting_category,
    "Sighting Value": (row) => row.sighting_value,
    [FIELD_LABEL_TLP_V2_MARKING]: (row) => row.tlp_v2_rating,
    "Created At (UTC)": (row) => formatTimestampForDisplay(row.created),
    "Modified At (UTC)": (row) => formatTimestampForDisplay(row.modified),
}

const RowActionPrimary = ({row}) => {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (<HorizontalActionButtonLayout>
        <EditIconOnlyButton to={urlForEditSighting(row.sighting_id)}/>
        <DeleteIconOnlyButton onClick={handleRequestOpen}/>
        <DeleteSightingModal open={open} onRequestClose={handleRequestClose} sighting={row}/>
    </HorizontalActionButtonLayout>);
}
RowActionPrimary.propTypes = {
    row: PropTypes.object.isRequired
}

function useResponsiveColumns() {
    const {isSmallScreen, isMediumScreen, isLargeScreen, isXLargeScreen} = useViewportBreakpoints();
    const [columns, setColumns] = React.useState(["Name", "STIX Pattern", "Sighting ID"]);
    useEffect(() => {
        if (isXLargeScreen) {
            setColumns(["Name", "STIX Pattern", "Sighting ID", "Grouping ID"]);
        } else if (isLargeScreen) {
            setColumns(["Name", "STIX Pattern", "Sighting ID"]);
        } else if (isMediumScreen) {
            setColumns(["Name", "STIX Pattern"]);
        } else {
            setColumns(["Name"]);
        }
    }, [isSmallScreen, isMediumScreen, isLargeScreen, isXLargeScreen]);
    return columns;
}

function RenderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const columns = useResponsiveColumns();
    const columnNameToCellValue = mappingOfColumnNameToCellValue.filter((column) => columns.includes(column.columnName));
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.sighting_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={columnNameToCellValue}
                                       rowActionPrimary={RowActionPrimary}
                                       actionsColumnWidth={120}
    />
    if (error) {
        return errorElement;
    }
    return loading ? loadingElement : table;
}

RenderDataTable.propTypes = {
    records: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string
}

function ListSightings() {
    const [query, setQuery] = React.useState({});
    const title = "Sightings";
    usePageTitle(title);

    return (
        <>
            <PageHeadingContainer>
                <PageHeading level={1}>{title}</PageHeading>
                <BaseButton inline icon={<Plus/>} label="New Sighting" appearance="primary" to={NEW_SIGHTING_PAGE}/>
            </PageHeadingContainer>
            <SightingsSearchBar onQueryChange={setQuery}/>
            <PaginatedDataTable renderData={RenderDataTable} fetchData={getSightings} query={query} onError={(e) => {
                createErrorToast(e);
            }}/>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('sighting_id') && queryParams.has('action', 'edit')) {
        const sightingId = queryParams.get('sighting_id');
        return <ViewOrEditSighting editMode sightingId={sightingId}/>
    }
    return (
        <ListSightings/>
    );

}

layoutWithTheme(<AppContainer><Router/></AppContainer>);
