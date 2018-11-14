# Diplo Umbraco.AuditLogViewer

Diplo Audit Log Viewer for Umbraco CMS (7.4 and above) allows you to easily view and search the audit data that is stored in the umbracoLog table in your site's database. This table contains all changes that are made to all content in your site (eg. Save, Publish, Delete events).

This log viewer allows you to view this data in an easy-to-use interface that integrates into the Umbraco Developer tree.

## Features ##

- Filter log data by log type (Save, Publish, Delete etc)
- Filter by user (ie. person responsible)
- Filter by date or date range (ie. all audit events that occurred within a given period)
- Filter by node (with easy to use content-picker)
- Search the log data comments by keyword
- Handy quick filters for the more common audit tasks
- Uses fast, server side pagination of data so it should be quick no matter how large your log table has become
- Quick "edit" links to users and content
- Slick, Angular interface that integrates with Umbraco developer tree

Read more in my blog post - https://www.diplo.co.uk/blog/web-development/diplo-audit-log-viewer-for-umbraco/

## Releases ##

> PM > Install-Package Diplo.AuditLogViewer

NuGet Package: https://www.nuget.org/packages/Diplo.AuditLogViewer/

Umbraco Package: https://our.umbraco.org/projects/developer-tools/diplo-audit-log-viewer/
