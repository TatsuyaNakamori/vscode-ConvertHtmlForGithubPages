概要
####

このエクステンションは、GitHub PagesにWebページをアップすると、レイアウトが崩れてしまう問題を解決するためのツールです。

.. figure:: ./../../_images/GitHubPages_doc_001.png
   :alt: image01
   :scale: 100%

------------------------------------------------------------

レイアウトが崩れる原因は2つあります。

* CSSなどのパス指定がサーバとローカルで異なり、GitHub Pagesのサーバー上のURLを指定する必要がある。
* GitHub Pagesはデフォルトで `jekyll <http://jekyllrb-ja.github.io/>`_ を使用してホスティングを行うため、jekyllでサポートしていないフォルダを正確に読み取ってくれない。

このエクステンションは、次のように解決します。

* HTMLに記述されているCSSファイルなどへの相対パスを、 ``<base>`` タグを使用してGitHub PagesのURLに変換します。
* GithHub Pagesを公開しているフォルダ直下に ``.nojekyll`` という空ファイルを置くことで、jekyllをホスティングしないようにします。

------------------------------------------------------------

| エクステンションは次の機能を提供します。
| 詳細は、 :ref:`使い方` / :ref:`各機能の詳細` をご確認ください。

* タスク (Terminal> Run Task...)

  * github pages: Convert to HTML for GitHub Pages
  * github pages: Create a ".nojekyll" file in [./docs]
  * github pages: Create a ".nojekyll" file in [workspaceFolder(./)]

.. figure:: ./../../_images/GitHubPages_doc_002.png
    :alt: image02
    :scale: 100%

.. figure:: ./../../_images/GitHubPages_doc_003.png
    :alt: image03
    :scale: 100%

