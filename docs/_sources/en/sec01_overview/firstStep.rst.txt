.. _howtouse:

How to use
##########



Task to create a .nojekyll file
*******************************

GitHub Pages allows you to publish html in the ``[Root]`` directory of the repository or in the ``[Root]/docs`` directory.
You can disable hosting of jekyll by placing an empty file ``.nojekyll`` directly under the directory to be published.

This extension will create a ``.nojekyll`` file directly under the ``[workspace folder]`` or ``[workspace folder]/docs`` folder you have open in VSCode.


Procedure
=========

1. Open the workspace folder ( ``File> Open Folder...`` )

   * Open the root Git repository you want to publish.
   * Only one workspace folder should be opened. (If you have more than one workspace folder open, the workspace that VSCode recognizes as the first index will be processed.)

2. Select the menu item ``Terminal> Run Task...``
3. From the dialog, select ``github pages > Create a ".nojekyll" file in [workspaceFolder(. /)]`` or ``github pages > Create a ".nojekyll" file in [. /docs]`` .


   .. figure:: ./../../_images/GitHubPages_doc_003.png
      :alt: image03
      :scale: 100%

4. If you see the following option, select ``Never scan the task output for github pages tasks`` and this option will not appear in the future (Even if you choose ``Never scan the task output for github pages tasks`` , the status of the process will still be shown in the Terminal)

   .. figure:: ./../../_images/GitHubPages_doc_005.png
      :alt: image05
      :scale: 100%

5. A ``.nojekyll`` file will be created in the ``workspaceFolder`` or ``docs`` folder.

   * If the ``docs`` folder does not exist, it will be created automatically.

6. If everything is OK, press any key in Terminal to close it.

   .. figure:: ./../../_images/GitHubPages_doc_006.png
      :alt: image06
      :scale: 75%

.. seealso::

   For detailed specifications, see :ref:`detailsfunction`.

----------------------------------------------------------------------

Task to pass for GitHub Pages
******************************

This extension does not allow you to make direct changes to HTML files that have been tested locally.
Please work with a separate folder for the documentation (HTML) and a separate folder for publishing to GitHub Pages.

Procedure
=========

1. Open the Settings tab from the menu ``File> Preferences> Settings`` .
2. Select ``Extentions> GitHub Pages`` from the Settings category.

   .. figure:: ./../../_images/GitHubPages_doc_004.png
      :alt: image04
      :scale: 80%

3. Specify the source directory as ``From`` and the destination directory as ``To`` .

   * It can be specified relative to the workspace folder.
   * Specify the current directory (workspace folder) using the notation ``.`` .
   * Specifies the upper hierarchy using the ``..`` notation.
   * If the directory to copy to does not exist, it will be created automatically.
   * You can also specify an absolute path.

4. In the ``URL for GitHub Pages`` field, enter the URL you want to publish to.

   * In ``https://<USERNAME>.github.io/<REPOSITORY>/`` , rewrite the ``<USERNAME>`` and ``<REPOSITORY>`` parts.
   * If you change ``<REPOSITORY>`` to ``${DIR_NAME}`` , it will be replaced by the workspace folder name (case-sensitive).

5. Select ``Terminal> Run Task...`` from the menu.
6. From the dialog, select ``github pages > Convert to HTML for GitHub Pages`` .

   .. figure:: ./../../_images/GitHubPages_doc_003.png
      :alt: image03
      :scale: 100%

7. If you see the following option, select ``Never scan the task output for github pages tasks`` and this option will not appear in the future (Even if you choose ``Never scan the task output for github pages tasks`` , the status of the process will still be shown in the Terminal)

   .. figure:: ./../../_images/GitHubPages_doc_005.png
      :alt: image05
      :scale: 100%

8. The contents of the source directory will be copied into the destination directory, and ``<base>`` tags will be inserted into the ``<head>`` of each HTML file.
9. If everything is OK, press any key in Terminal to close it.

   .. figure:: ./../../_images/GitHubPages_doc_007.png
      :alt: image07
      :scale: 75%


.. seealso::

   For detailed specifications, see :ref:`detailsfunction`.

