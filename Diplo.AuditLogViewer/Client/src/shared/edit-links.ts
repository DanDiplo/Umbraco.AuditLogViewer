import { UMB_EDIT_DATA_TYPE_WORKSPACE_PATH_PATTERN } from "@umbraco-cms/backoffice/data-type";
import { UMB_DOCUMENT_ENTITY_TYPE, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN } from "@umbraco-cms/backoffice/document";
import { UMB_DOCUMENT_TYPE_ENTITY_TYPE, UMB_EDIT_DOCUMENT_TYPE_WORKSPACE_PATH_PATTERN } from "@umbraco-cms/backoffice/document-type";
import { UMB_EDIT_MEDIA_WORKSPACE_PATH_PATTERN, UMB_MEDIA_ENTITY_TYPE } from "@umbraco-cms/backoffice/media";
import { UMB_EDIT_MEMBER_WORKSPACE_PATH_PATTERN, UMB_MEMBER_ENTITY_TYPE } from "@umbraco-cms/backoffice/member";
import { UmbModalRouteRegistrationController } from "@umbraco-cms/backoffice/router";
import { UMB_TEMPLATE_ENTITY_TYPE } from "@umbraco-cms/backoffice/template";
import { UMB_WORKSPACE_EDIT_PATH_PATTERN, UMB_WORKSPACE_MODAL } from "@umbraco-cms/backoffice/workspace";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

type EditableLogEntityType = "content" | "documentType" | "media" | "member" | "template" | "dataType" | "partial";

export function canOpenLogEntity(entityType: string | null | undefined): boolean {
    return toEditableLogEntityType(entityType) !== undefined;
}

export function openLogEntityEditorModal(host: UmbControllerHost, unique: string | null | undefined, entityType: string | null | undefined, event?: Event): void {
    if (!unique) return;
    const editableType = toEditableLogEntityType(entityType);
    if (!editableType) return;

    event?.preventDefault();
    event?.stopPropagation();

    const workspaceType = workspaceEntityType(editableType);

    new UmbModalRouteRegistrationController(host, UMB_WORKSPACE_MODAL)
        .addAdditionalPath(workspaceType)
        .onSetup(() => ({
            data: {
                entityType: workspaceType,
                preset: {}
            }
        }))
        .onSubmit(() => undefined)
        .onReject(() => undefined)
        .observeRouteBuilder((routeBuilder) => {
            const modalPath = routeBuilder({});
            const workspacePath = editWorkspacePath(editableType, unique);

            history.pushState(null, "", `${modalPath}/${workspacePath}`);
            window.dispatchEvent(new PopStateEvent("popstate"));
        });
}

function toEditableLogEntityType(entityType: string | null | undefined): EditableLogEntityType | undefined {
    switch ((entityType ?? "").toLowerCase()) {
        case "document":
            return "content";
        case "documenttype":
            return "documentType";
        case "media":
            return "media";
        case "member":
            return "member";
        case "template":
            return "template";
        case "datatype":
            return "dataType";
        case "partial-view":
            return "partial";
        default:
            return undefined;
    }
}

function workspaceEntityType(entityType: EditableLogEntityType): string {
    switch (entityType) {
        case "content":
            return UMB_DOCUMENT_ENTITY_TYPE;
        case "documentType":
            return UMB_DOCUMENT_TYPE_ENTITY_TYPE;
        case "media":
            return UMB_MEDIA_ENTITY_TYPE;
        case "member":
            return UMB_MEMBER_ENTITY_TYPE;
        case "template":
            return UMB_TEMPLATE_ENTITY_TYPE;
        case "dataType":
            return "data-type";
        case "partial":
            return "partial-view";
    }
}

function editWorkspacePath(entityType: EditableLogEntityType, unique: string): string {
    switch (entityType) {
        case "content":
            return UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN.generateLocal({ unique });
        case "documentType":
            return UMB_EDIT_DOCUMENT_TYPE_WORKSPACE_PATH_PATTERN.generateLocal({ unique });
        case "dataType":
            return UMB_EDIT_DATA_TYPE_WORKSPACE_PATH_PATTERN.generateLocal({ unique });
        case "media":
            return `${UMB_EDIT_MEDIA_WORKSPACE_PATH_PATTERN.generateLocal({ unique })}/invariant`;
        case "member":
            return UMB_EDIT_MEMBER_WORKSPACE_PATH_PATTERN.generateLocal({ unique });
        case "template":
        case "partial":
            return UMB_WORKSPACE_EDIT_PATH_PATTERN.generateLocal({ unique });
    }
}
