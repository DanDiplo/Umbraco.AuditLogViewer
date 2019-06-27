Diplo Audit Log Viewer for Umbraco 8 and above
----------------------------------------------

A viewer for the umbracoLog and umbracoAudit tables that contains a log of all content changes and actions by users

Installation
------------

You can install either via NuGet or via a package downloaded from https://our.umbraco.com/ - make sure you install the 2x version for Umbraco 8

After a succesfull installation you should see two new trees in the Settings > Third Party section of Umbraco:

- Content Audit Logs
- Audit Trail Logs

If you have any issues then try restarting the site (eg. touch web.config) and if you have any JavaScript issues then try incrementing the "version" setting in /config/ClientDependency.config
Another option is to delete the TEMP folder in /App_Data/

If you do have any issues check the console log in your browser.

You can report any issues you have on GitHub at https://github.com/DanDiplo/Umbraco.AuditLogViewer/issues (make sure to include the Umbraco version you are using)

Usage
-----

Content Audit Logs
------------------

Click the Content Audit Logs tree heading to view a table of all changes to content.

You can then use the filters at the top to filter the data. You can also use the quick filters in the tree to quickly filter by date range or by the top pages to be modified recently.

You can order any column by clicking on it's heading. Clicking again reverses the order.

If you see an entry with an "eye" symbol next to the Action name you can click the row to view the log comment text.

If an entry has a value under the Node column you can click the ID and it will take you to edit the associated content that has been changed - whether this be a page, a document type or media etc.

Use the pagination to move between pages of log data.

Audit Trail Logs
----------------

Click the Audit Trail Logs tree heading to view a table of all audit trail events.

You can then use the filters at the top to filter the data. You can also use the quick filters in the tree to quickly filter by date range.

You can order any column by clicking on it's heading. Clicking again reverses the order.

Use the pagination to move between pages of log data.

Acknowledgments
----------------

Thanks to all the Umbraco community for your help, wisdom and encouragement #h5yr

More Info
---------

You can find a blog post here:

https://www.diplo.co.uk/blog/web-development/diplo-audit-log-viewer-for-umbraco-8/

Source code and download links can be found on GitHub:

https://github.com/DanDiplo/Umbraco.AuditLogViewer



