import {useEffect, useState} from "react";
import {errorToText, getStixPatternSuggestion} from "@splunk/my-page/src/ApiClient";
import {useDebounce} from "@splunk/my-page/src/debounce";

export const usePatternSuggester = (indicatorCategory, indicatorValue) => {
    const [suggestedPattern, setSuggestedPattern] = useState(null);
    const [error, setError] = useState(null);
    const debounceIndicatorValue = useDebounce(indicatorValue, 200);
    useEffect(() => {
        if (!!indicatorCategory && !!debounceIndicatorValue) {
            getStixPatternSuggestion(indicatorCategory, debounceIndicatorValue, (resp) => {
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
    }, [indicatorCategory, debounceIndicatorValue]);
    return {suggestedPattern, error};
}
