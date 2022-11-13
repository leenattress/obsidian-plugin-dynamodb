import { App, Notice, SuggestModal } from "obsidian";

interface Region {
    name: string;
    location: string;
}
type Callback = (table: string) => void;

// a list of all aws regions as object of their name and location
const regions = [
    { name: "US East (N. Virginia)", location: "us-east-1" },
    { name: "US East (Ohio)", location: "us-east-2" },
    { name: "US West (N. California)", location: "us-west-1" },
    { name: "US West (Oregon)", location: "us-west-2" },
    { name: "Asia Pacific (Mumbai)", location: "ap-south-1" },
    { name: "Asia Pacific (Seoul)", location: "ap-northeast-2" },
    { name: "Asia Pacific (Singapore)", location: "ap-southeast-1" },
    { name: "Asia Pacific (Sydney)", location: "ap-southeast-2" },
    { name: "Asia Pacific (Tokyo)", location: "ap-northeast-1" },
    { name: "Canada (Central)", location: "ca-central-1" },
    { name: "China (Beijing)", location: "cn-north-1" },
    { name: "China (Ningxia)", location: "cn-northwest-1" },
    { name: "EU (Frankfurt)", location: "eu-central-1" },
    { name: "EU (Ireland)", location: "eu-west-1" },
    { name: "EU (London)", location: "eu-west-2" },
    { name: "EU (Paris)", location: "eu-west-3" },
    { name: "EU (Stockholm)", location: "eu-north-1" },
    { name: "Middle East (Bahrain)", location: "me-south-1" },
    { name: "South America (São Paulo)", location: "sa-east-1" },
    { name: "AWS GovCloud (US-East)", location: "us-gov-east-1" },
    { name: "AWS GovCloud (US-West)", location: "us-gov-west-1" },
];

export class SetRegionModal extends SuggestModal<Region> {
    callback: Callback;
	constructor(app: App, callback: Callback) {
		super(app);
        this.callback = callback;
	}  
    // Returns all available suggestions.
    getSuggestions(query: string): Region[] {
        return regions.filter((region: Region) =>
            region.name.toLowerCase().includes(query.toLowerCase()) ||
            region.location.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Renders each suggestion item.
    renderSuggestion(region: Region, el: HTMLElement) {
        el.createEl("div", { text: region.name });
        el.createEl("small", { text: region.location });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(region: Region, evt: MouseEvent | KeyboardEvent) {
        this.callback(region.location);
    }
}