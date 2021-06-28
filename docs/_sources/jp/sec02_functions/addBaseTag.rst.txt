GitHub Pages用にパスを通すTaskの仕様
####################################

.. figure:: ./../../_images/GitHubPages_doc_009.png
   :alt: image09
   :scale: 100%

次の処理を行います。

1. 次の、Settings(Configuration)の内容を確認します

   * From
   * To
   * URL for GitHub Pages

   .. figure:: ./../../_images/GitHubPages_doc_004.png
      :alt: image04
      :scale: 75%

2. ``From`` で指定したパスが存在するかどうか確認します

   * 存在しない場合は終了します (異常終了扱い)

3. ``To`` で指定したパスが存在するかどうか確認します

   * 存在しない場合は作成します
   * 作成出来なかった場合は終了します (異常終了扱い)

4. ``URL for GitHub Pages`` で指定したURLを確認します

   * プレースホルダの ``<USERNAME>`` や ``<REPOSITORY>`` が残っている場合は終了します (異常終了扱い)
   * ``${DIR_NAME}`` キーワードがある場合は、ワークスペースフォルダ名で置き換えます

5. ``.nojekyll`` ファイルが存在するかどうか確認します

   * 存在の有無の情報を格納します

6. ``To`` で指定したディレクトリ内のファイル/フォルダを削除します

   * ディレクトリの中の ``.nojekyll`` ファイルも削除されます
7. ``From`` で指定したディレクトリのデータを、 ``To`` で指定したディレクトリにコピーします
8. ``.nojekyll`` ファイルが存在していた場合は、作り直します
9. ``To`` ディレクトリ内のHTMLファイルをフェッチし、各ファイルの ``<head>`` に、 ``<base>`` タグを挿入します

---------------------------------------------------------------------------

Taskを実行した時に問題が起こった場合は、Terminalのメッセージを確認してください。
エラーの原因を特定する唯一の方法です。

[下図] Terminalに赤文字の警告文や、 ``The terminal process faild to launch (exit code:2)`` のようなメッセージが表示された場合は、何か問題が起こって処理が中断された事を示しています。

メッセージの内容を確認し、実行環境に問題ないか確認してください。

.. figure:: ./../../_images/GitHubPages_doc_011.png
   :alt: image11
   :scale: 100%


.. note::
   もし、トラブルが解決できない場合は、 `Issues <https://github.com/TatsuyaNakamori/vscode-ConvertHtmlForGithubPages/issues>`_ に報告してください。バグなどの報告はこのページからのみ受け付けています。

