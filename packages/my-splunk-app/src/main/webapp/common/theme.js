import layout from "@splunk/react-page/18";
import {getUserTheme} from "@splunk/splunk-utils/themes";

// https://dev.splunk.com/enterprise/docs/developapps/createapps/buildapps/adduithemes/
// layout() docs: https://splunkui.splunk.com/Packages/react-page/API
// You can also specify page title with layout()
export const layoutWithTheme = (component) => {
    getUserTheme().then((theme) => {
        // getUserTheme() returns a string such as 'light' or 'dark'
        console.log(`User theme: ${theme}`);
        return layout(component, {theme})
    });
};

