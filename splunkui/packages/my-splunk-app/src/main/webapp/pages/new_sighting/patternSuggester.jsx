import {useEffect, useState} from "react";
import {errorToText, getStixPatternSuggestion} from "@splunk/my-page/src/ApiClient";
import {useDebounce} from "@splunk/my-page/src/debounce";

export const usePatternSuggester = (sightingCategory, sightingValue) => {
    const [suggestedPattern, setSuggestedPattern] = useState(null);
    const [error, setError] = useState(null);
    const debounceSightingValue = useDebounce(sightingValue, 200);
    useEffect(() => {
        if (!!sightingCategory && !!debounceSightingValue) {
            getStixPatternSuggestion(sightingCategory, debounceSightingValue, (resp) => {
                console.log("Pattern Suggestion response:", resp);
                setSuggestedPattern(resp?.pattern);
                setError(null);
            }, async (errorResp) => {
                const errorText = await errorToText(errorResp);
                console.error(errorResp, errorText);
                setError(errorText);
                setSuggestedPattern("...");
            }).then();
        } else {
            setSuggestedPattern(null);
        }
    }, [sightingCategory, debounceSightingValue]);
    return {suggestedPattern, error};
}
