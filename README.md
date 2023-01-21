# 🚀 Semantic-MediaWiki-Graph

## The link to the user documentation

https://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki_Graph

MediaWiki Extension: SemanticMediaWikiGraph
This extension for MediaWiki allows users to create and visualize a graph of semantic data stored in the wiki using a combination of JavaScript libraries and PHP.

## Features

Provides a user interface for creating and visualizing a graph of semantic data stored in the wiki using a combination of JavaScript libraries and PHP
Includes options for customizing the graph layout and display
Can be used with the Semantic MediaWiki extension to query and display semantic data in the graph

## Installation

Download the extension files and place them in the extensions directory of your MediaWiki installation.
Add the following line to your `LocalSettings.php` file:
```
wfLoadExtension( 'SemanticMediaWikiGraph' );
```

Configure the extension by setting any necessary options in LocalSettings.php

## Requirements

MediaWiki 1.35+
Semantic MediaWiki extension (if you want to use semantic data)
JavaScript Libraries (`d3.js`)

## Usage

To create a graph, navigate to Special:SemanticMediaWikiGraph in the wiki and configure the graph options.
Once the graph is created, it can be accessed and modified through the Special:SemanticMediaWikiGraph page.
The graph can also be embedded on other pages using the <semanticmediawikigraph> tag.
Contribution
You can submit issues, bugs, or feature requests through the GitHub repository
You can also fork the repository and submit pull requests with your contributions.
Licensing
This extension is licensed under the GNU General Public License v3.0.

## Additional information

The dist folder contains the compiled and minified version of the JavaScript code.
The includes folder contains the PHP code for the extension.
The node_modules folder contains the npm packages used for development.
The .github, .idea, .vs, .vscode folders are for internal use and development environment.


### Developer information
This project has been created using **webpack-cli**, you can now run

```
npm run build
```

### Files

#### Extension.json 
is a configuration file for a MediaWiki extension. It contains information such as the extension's name, description, authors, and dependencies.
But currently the configuration in this project is also set in the `SemanticMediaWikiGraph.php` 

#### Package.json
is a configuration file that is used by the Node Package Manager (npm). It contains information about a Node.js project, such as the project's name, version, dependencies, and scripts.

The "dependencies" field in "package.json" specifies the packages that your project depends on, and the "scripts" field specifies scripts that can be run in the project.

#### Tsconfig.json
is a configuration file for the TypeScript compiler. It contains information on how the compiler should process the project's TypeScript files, such as include and exclude paths for the files to be compiled.

#### Webpack.config.js
is a configuration file for Webpack, a popular front-end build tool. It specifies how Webpack should process and bundle the project's files, such as which files should be included, which files should be excluded, and the output location for the final bundle.

Webpack is used to bundle and optimize assets, such as JavaScript, CSS, and images, for web applications. It allows you to write modular code and to use modern JavaScript features.

Webpack works by taking your source files, such as JavaScript (many) and CSS, and transforming them into a bundled output (usually a single JavaScript file). It can also optimize your assets by minifying and compressing them.