import {useEffect, useState} from 'react';
import {getTaxiiCollection} from "@splunk/my-react-component/src/ApiClient";
import {isString} from "lodash";

export function useValidateCollectionId(collectionId, taxiiConfigName, enabled) {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [collectionMetadata, setCollectionMetadata] = useState(null);

    useEffect(() => {
        setError(null);
        if(enabled && isString(collectionId) && collectionId !== ""){
            setLoading(true);
            getTaxiiCollection({
                taxiiConfigName,
                collectionId,
                successHandler: (resp) => {
                    console.log("Collection metadata:", resp);
                    if(resp?.can_write !== true) {
                        setError(`Credential does not have can_write permission on Collection ${collectionId}`);
                    }
                    setCollectionMetadata(resp);
                    setLoading(false);
                },
                errorHandler: async (errorResponse) => {
                    const errMessage = `Error getting metadata for collection ${collectionId}: ${errorResponse.status} ${errorResponse.statusText}`
                    console.error(await errorResponse.text());
                    setError(errMessage);
                    setLoading(false);
                }
            }).then();
        }

    }, [enabled, collectionId, taxiiConfigName]);

    return {error, loading, collectionMetadata};
}
