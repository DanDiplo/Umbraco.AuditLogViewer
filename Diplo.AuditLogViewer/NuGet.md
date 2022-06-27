# Diplo Umbraco Audit Log Viewer

**Diplo Audit Log Viewer** for **Umbraco CMS** allows you to easily view and search the Content changes and Audit data that is stored in your Umbraco site's `umbracoLog` and `umbracoAudit` tables.

It creates a custom tree within the **Settings** section that lets you view the contents of both those tables and presents the results in a filterable, sortable and searchable paginated list.

## Features

### Content Log Viewer

The content log viewer allows you to view the log of changes to content within your Umbraco site. You can:

- Filter log data by log type (Save, Publish, Delete etc)
- Filter by user (ie. person responsible)
- Filter by date or date range (ie. all content changes that occurred within a given period)
- Filter by page (node) - with easy to use content-picker
- Sort data by any column
- Search the log data comments by keyword
- Handy quick filters for the more common filters
- Quick "edit" links to affected content - whether it be a page in Umbraco, a Member or Content Type etc.

### Audit Trail Viewer

The audit trail viewer allows you to view audit events, such as a user login or an edit to a user's profile. You can:

- Filter the event data by event type (login, save etc)
- Filter by the person responsible for the event
- Filter by the person affected by the event (if relevant)
- Filter by date range
- Search the events by keyword
- Sort data by any column
- Quick filters for searching by date range

Both use fast, server side pagination of data so it should be quick no matter how large your tables have become. You can sort the data via column, either ascending or descending.

**Note:** The 10.x version is for Umbraco 10. The 8.x version is for Umbraco 8

**More**: https://www.diplo.co.uk/blog/web-development/diplo-audit-log-viewer-for-umbraco-8/

**Our**: https://our.umbraco.com/packages/developer-tools/diplo-audit-log-viewer/

**Twitter**: https://twitter.com/DanDiplo