import type { UmbEntryPointOnInit } from "@umbraco-cms/backoffice/extension-api";
import { allManifests } from "./manifests";

export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
    extensionRegistry.registerMany(allManifests);
};
