import {useEffect, useState} from "react";
import {listSightingCategories} from "@splunk/my-page/src/ApiClient";

export default function useSightingCategories() {
    const [sightingCategories, setSightingCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        listSightingCategories((resp) => {
            console.log(resp);
            setSightingCategories(resp.categories.map((category) => ({label: category, value: category})));
            setLoading(false);
        }, console.error).then();
    }, []);
    return {sightingCategories, loading}

}
