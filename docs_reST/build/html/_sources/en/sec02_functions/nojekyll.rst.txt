Specification of the Task to create a .nojekyll file
####################################################

.. figure:: ./../../_images/GitHubPages_doc_008.png
   :alt: image08
   :scale: 100%

This task performs the following operations:

1. Check if the directory where the ``.nojekyll`` file is to be created exists, and if not, create it.

   * If the creation fails, the process is terminated (treated as an abnormal termination).

2. Create the ``.nojekyll`` file.

   * If the file already exists, do nothing (treat as normal exit).
   * If the creation fails, the process is terminated (treated as an abnormal termination).

---------------------------------------------------------------------------

If the ``.nojekyll`` file is not created after running Task, check your Terminal messages.
This is the only way to determine the cause of the error.

[Figure below] If you see messages like ``[Failed]`` or ``The terminal process faild to launch (exit code:2)`` in the terminal, it means that something went wrong and the process was interrupted.

Check the contents of the message and make sure there is no problem with the execution environment.

.. figure:: ./../../_images/GitHubPages_doc_010.png
   :alt: image10
   :scale: 100%


.. note::
   If you cannot solve a problem, please report it in `Issues <https://github.com/TatsuyaNakamori/vscode-ConvertHtmlForGithubPages/issues>`_ . Bugs and other reports are only accepted from this page.

