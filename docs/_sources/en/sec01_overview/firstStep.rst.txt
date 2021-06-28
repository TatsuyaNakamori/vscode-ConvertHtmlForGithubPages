.. _howtouse:

How to use
##########



Task to create a .nojekyll file
*******************************

GitHub Pagesではリポジトリの ``[Root]`` ディレクトリ、もしくは ``[Root]/docs`` ディレクトリ内のhtmlを公開することができます。
公開するディレクトリ直下に ``.nojekyll`` という空ファイルを置くことで、jekyllをホスティングさせない事ができます。

このエクステンションはVSCodeで開いている ``[ワークスペースフォルダ]`` 直下、もしくは ``[ワークスペースフォルダ]/docs`` フォルダ直下に ``.nojekyll`` ファイルを生成します。


手順
====
1. ワークスペースフォルダ(フォルダ)を開きます( ``File> Open Folder...`` )

   * 公開するGitのルートリポジトリを開きます
   * 開くワークスペースフォルダは、1つだけにしてください (複数のワークスペースフォルダを開いている場合は、VSCodeが最初のインデックスとして認識しているワークスペースに対して処理が行われます)

2. メニューの ``Terminal> Run Task...`` を選択します
3. ダイアログから、 ``github pages > Create a ".nojekyll" file in [workspaceFolder(./)]`` もしくは ``github pages > Create a ".nojekyll" file in [./docs]`` を選択します

   .. figure:: ./../../_images/GitHubPages_doc_003.png
      :alt: image03
      :scale: 100%

4. 次のような選択肢が出てきた場合は、 ``Never scan the task output for github pages tasks`` を選ぶと、今後この選択肢は出てこなくなります ( ``Never scan the task output for github pages tasks`` を選択した場合でも、処理の状況はTerminalに表示されます)

   .. figure:: ./../../_images/GitHubPages_doc_005.png
      :alt: image05
      :scale: 100%

5. ``ワークスペースフォルダ直下`` もしくは ``docs`` フォルダ内に ``.nojekyll`` ファイルが生成されます

   * ``docs`` フォルダが存在しない場合は、自動的に作成されます

6. 問題が無ければ、Terminal上で何かキーを押して、閉じてください

   .. figure:: ./../../_images/GitHubPages_doc_006.png
      :alt: image06
      :scale: 75%

.. seealso::

   詳細な仕様は、 :ref:`各機能の詳細` をご確認ください。

----------------------------------------------------------------------

Task to pass for GitHub Pages
******************************

このエクステンションでは、ローカルで動作確認したHTMLファイルに直接変更を加えることはできません。
ドキュメント(HTML)を作成するフォルダと、GitHub Pagesに公開するフォルダを分けて作業してください。


手順
====
1. メニューの ``File> Preferences> Settings`` から、Settingsタブを開きます
2. Settingsのカテゴリから ``Extentions> GitHub Pages`` を選択します

   .. figure:: ./../../_images/GitHubPages_doc_004.png
      :alt: image04
      :scale: 80%

3. ``From`` にコピー元のディレクトリを指定し、 ``To`` にコピー先のディレクトリを指定します

   * ワークスペースフォルダからの相対パスで指定することができます
   * ``.`` 表記でカレントディレクトリ(ワークスペースフォルダ)を、 ``..`` 表記で上の階層を指定します
   * コピー先のディレクトリが存在しない場合は自動的に作成されます
   * 絶対パス表記でも指定可能です

4. ``URL for GitHub Pages`` には、公開先のURLを入力してください

   * ``https://<USERNAME>.github.io/<REPOSITORY>/`` の、 ``<USERNAME>`` と ``<REPOSITORY>`` の部分を書き換えます
   * ``<REPOSITORY>`` の部分を ``${DIR_NAME}`` という表記にすると、ワークスペースフォルダ名に置き換わります(大文字・小文字を区別します)

5. メニューの ``Terminal> Run Task...`` を選択します
6. ダイアログから、 ``github pages > Convert to HTML for GitHub Pages`` を選択します

   .. figure:: ./../../_images/GitHubPages_doc_003.png
      :alt: image03
      :scale: 100%

7. 次のような選択肢が出てきた場合は、 ``Never scan the task output for github pages tasks`` を選ぶと、今後この選択肢は出てこなくなります ( ``Never scan the task output for github pages tasks`` を選択した場合でも、処理の状況はTerminalに表示されます)

   .. figure:: ./../../_images/GitHubPages_doc_005.png
      :alt: image05
      :scale: 100%

8. コピー元のディレクトリの中身が、コピー先のディレクトリにコピーされ、各HTMLファイルの ``<head>`` 内に ``<base>`` タグが挿入されます
9. 問題が無ければ、Terminal上で何かキーを押して、閉じてください

   .. figure:: ./../../_images/GitHubPages_doc_007.png
      :alt: image07
      :scale: 75%


.. seealso::

   詳細な仕様は、 :ref:`各機能の詳細` をご確認ください。

