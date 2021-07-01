Specification of the Task to pass for GitHub Pages
##################################################

.. figure:: ./../../_images/GitHubPages_doc_009.png
   :alt: image09
   :scale: 100%

This task performs the following operations:

1. In the Settings (Configuration), check the following items

   * From
   * To
   * URL for GitHub Pages

   .. figure:: ./../../_images/GitHubPages_doc_004.png
      :alt: image04
      :scale: 75%

2. Checks if the path specified by ``From`` exists.

   * Exit if it does not exist (treated as an abnormal exit).

3. Checks if the path specified by ``To`` exists.

   * If it doesn't exist, create it.
   * Exit the program if it cannot be created (treated as an abnormal exit).

4. Check the URL specified in ``URL for GitHub Pages`` .

   * Exit if any placeholder ``<USERNAME>`` or ``<REPOSITORY>`` remains (treated as abnormal exit).
   * Replace the ``${DIR_NAME}`` keyword, if present, with the name of your workspace folder.

5. Check to see if the ``.nojekyll`` file exists.

   * Keeps information on whether or not it exists

6. Deletes files/folders in the directory specified by ``To`` .

   * The ``.nojekyll`` file in the directory will also be removed.

7. Copies the data in the directory specified by ``From`` to the directory specified by ``To`` .
8. If the ``.nojekyll`` file exists, recreate it.
9. Fetch HTML files in the ``To`` directory and insert ``<base>`` tags in the ``<head>`` of each file.

---------------------------------------------------------------------------

If you encounter problems when running the Task, check the Terminal messages.
This is the only way to determine the cause of the error.

[Figure below] If you see a red warning message in the terminal or a message like ``The terminal process faild to launch (exit code:2)`` , it means that something went wrong and the process was interrupted.

Check the contents of the message and make sure there is no problem with the execution environment.

.. figure:: ./../../_images/GitHubPages_doc_011.png
   :alt: image11
   :scale: 100%


.. note::
   If you cannot solve a problem, please report it in `Issues <https://github.com/TatsuyaNakamori/vscode-ConvertHtmlForGithubPages/issues>`_ . Bugs and other reports are only accepted from this page.
