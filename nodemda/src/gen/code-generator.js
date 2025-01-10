/*
Copyright (C) 2016 by Joel Kozikowski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

"use strict";

const NodeMDA = require('../nodemda-core.js');
const MetaModel = require('../meta/meta-model.js');
require('../meta/meta-validator.js');

const fsx = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const glob = require('glob');
const winston = require('winston');
const pluralize = require('pluralize');


/**
 * Context for the current run of the code generator
 */
class GeneratorContext {
	constructor() {
		this.requires = [];
		this.contributes = [];
		this.plugins = [];
	}
}

class PluginDefinition {
	constructor(name, absoluteFilePath, moduleObject) {
		this.name = name;
		this.absoluteFilePath = absoluteFilePath;
		this.moduleObject = moduleObject;
	}
}

class FileEntry {
	constructor(virtualPath, absolutePath, fromModule) {
		this.virtualPath = virtualPath;
		this.absolutePath = absolutePath;
		this.fromModule = fromModule;
	}
}


(function(mda){

    let ctxGen = null;

	let allFiles = null;

	function initGeneratorContext(pluginList) {

		ctxGen = new GeneratorContext();
		const processedPlugins = new Set();

		// Helper function to load package.json
		function loadPackageJson(packageName) {
			try {
				const packagePath = require.resolve(packageName);
				const packageDir = path.dirname(packagePath);
				const packageJsonPath = path.join(packageDir, 'package.json');
				return JSON.parse(fsx.readFileSync(packageJsonPath, 'utf8'));
			} catch (error) {
				console.warn(`Warning: Could not load package.json for ${packageName}. Skipping.`);
				return null;
			}
		}

		// Helper function to process a single plugin
		function processPlugin(pluginName) {
			if (processedPlugins.has(pluginName)) {
				return; // Skip already processed plugins
			}

			processedPlugins.add(pluginName);

			try {
				let pluginFileName = pluginName;
				if (!pluginName.startsWith('nodemda-')) {
					pluginFileName = 'nodemda-' + pluginName;
				}
				const moduleObject = require(pluginFileName);
				const packageJson = loadPackageJson(pluginFileName);

				if (!moduleObject || !packageJson) return;

				// Validate required properties
				if (!moduleObject.type || !moduleObject.name || !moduleObject.version) {
					console.warn(`Warning: ${pluginName} is missing required properties. Skipping.`);
					return;
				}

				// Validate type
				const validTypes = ['templates', 'mixin', 'stack']; // 'reader' not valid for code generation
				if (!validTypes.includes(moduleObject.type)) {
					console.warn(`Warning: ${pluginName} has an invalid type "${moduleObject.type}". Skipping.`);
					return;
				}

				const packagePath = require.resolve(pluginFileName);
				const pluginDefinition = new PluginDefinition(pluginFileName, packagePath, moduleObject);

				// Add contributions
				if (Array.isArray(moduleObject.contributes)) {
					ctxGen.contributes.push(...moduleObject.contributes);
				}

				// Add requirements
				if (Array.isArray(moduleObject.requires)) {
					ctxGen.requires.push(...moduleObject.requires);
				}

				winston.info("   Using plugin: " + pluginFileName);

				// If type is "stack", process its dependencies
				if (moduleObject.type === 'stack' && packageJson.dependencies) {
					Object.keys(packageJson.dependencies).forEach(processPlugin);
				}

				// Add plugin to ctxGen
				ctxGen.plugins.push(pluginDefinition);
			} catch (error) {
				console.warn(`Warning: Error processing ${pluginName}: ${error}`);
			}
		}

		// Process each plugin in the initial list
		pluginList.forEach(processPlugin);
	}



	function validateContext() {
		let isValid = true;
	
		// Every entry in ctxGen.requires exists in ctxGen.contributes
		ctxGen.requires.forEach(required => {
			if (!ctxGen.contributes.includes(required)) {
				// Find the plugin(s) that require this item
				const requestingPlugins = ctxGen.plugins
					.filter(plugin => plugin.moduleObject.requires?.includes(required))
					.map(plugin => plugin.name);
	
				console.error(
					`Error: Required item "${required}" is missing from contributes. ` +
					`Requested by plugin(s): ${requestingPlugins.join(', ')}`
				);
	
				isValid = false;
			}
		});
	
		return isValid;
	}
	

	function sortFileEntriesByDependency(fileEntries) {
		// Build a directed graph for plugin dependencies
		const graph = new Map();
		const contributesMap = new Map();
	
		// Create nodes for all plugins
		fileEntries.forEach(entry => {
			const plugin = entry.fromModule;
			if (!graph.has(plugin)) {
				graph.set(plugin, new Set());
			}
	
			// Map contributions to the plugin for reverse lookup
			if (plugin.contributes) {
				plugin.contributes.forEach(contribute => contributesMap.set(contribute, plugin));
			}
		});
	
		// Add edges based on "requires"
		graph.forEach((_, plugin) => {
			if (plugin.requires) {
				plugin.requires.forEach(required => {
					const contributingPlugin = contributesMap.get(required);
					if (contributingPlugin && contributingPlugin !== plugin) {
						graph.get(plugin).add(contributingPlugin);
					}
				});
			}
		});
	
		// Perform topological sort
		const visited = new Set();
		const tempVisited = new Set();
		const sortedPlugins = [];
	
		function visit(plugin) {
			if (tempVisited.has(plugin)) {
				throw new Error("Cyclic dependency detected");
			}
			if (!visited.has(plugin)) {
				tempVisited.add(plugin);
				graph.get(plugin).forEach(visit);
				tempVisited.delete(plugin);
				visited.add(plugin);
				sortedPlugins.push(plugin);
			}
		}
	
		graph.forEach((_, plugin) => visit(plugin));
	
		// Create a mapping of plugin to its topological order
		const pluginOrder = new Map();
		sortedPlugins.reverse().forEach((plugin, index) => pluginOrder.set(plugin, index));

		// Sort file entries
		return fileEntries.sort((a, b) => {
			const pluginAOrder = pluginOrder.get(a.fromModule);
			const pluginBOrder = pluginOrder.get(b.fromModule);
			if (pluginAOrder !== pluginBOrder) {
				return pluginBOrder - pluginAOrder;
			}
			return a.virtualPath.localeCompare(b.virtualPath);
		});
	}	


	function getPluginFiles() {
	
		if (allFiles !== null) {
			// We have already read in all of the files.
			return;
		}

		const fileEntries = [];
	
		// Helper function to recursively gather files
		function collectFiles(baseDir, rootVirtualPath, fromModule) {
			const entries = fsx.readdirSync(baseDir, { withFileTypes: true });
	
			entries.forEach(entry => {
				const absolutePath = path.join(baseDir, entry.name);
				const virtualPath = path.join(rootVirtualPath, entry.name);
	
				if (entry.isDirectory()) {
					collectFiles(absolutePath, virtualPath, fromModule);
				} else {
					fileEntries.push(new FileEntry(virtualPath, absolutePath, fromModule));
				}
			});
		}
	
		// Add the "plugins" directories from each plugin in ctxGen.plugins
		ctxGen.plugins.forEach(plugin => {
			const pluginPluginsPath = path.join(path.dirname(plugin.absoluteFilePath), 'plugins');
	
			if (fsx.existsSync(pluginPluginsPath)) {
				collectFiles(pluginPluginsPath, 'plugins', plugin.moduleObject);
			}
		});

		allFiles = sortFileEntriesByDependency(fileEntries)
	}
	

	function getFilesForPath(dirPath, ext) {
		// Validate inputs
		if (!dirPath) {
			console.error("Directory path must be specified.");
			return [];
		}
		if (!ext) {
			console.error("File extension must be specified.");
			return [];
		}
	
		const targetPath = `plugins/${dirPath}`;
	
		const fileList = allFiles
			.filter(file => file.virtualPath.startsWith(targetPath) && file.virtualPath.endsWith(ext))
			.map(file => file.absolutePath);

		return fileList;
	}


	function getFilesForStereotype(dirPath, stereotype, ext) {

		let marker = "{";
		if (stereotype !== null) {
			if (typeof(stereotype) === "object") {
				marker += stereotype.getName();
			}
			else {
		       marker += stereotype;
			}
		}

		let marker1 = marker + "}";
		let marker2 = marker + "_s}";

		const targetPath = `plugins/${dirPath}`;

		let files =
          allFiles.filter(file => {
            const matchesMarker =
                (file.virtualPath.includes(marker1)) ||
                (file.virtualPath.includes(marker2));

            const inTargetDir = file.virtualPath.startsWith(targetPath);

            const matchesExtension = file.virtualPath.endsWith(ext);

            return matchesMarker && matchesExtension && inTargetDir;
        })
        .map(file => file.absolutePath);

		files.sort();
		return files;
	};


	/**
	 * Checks each parent directory of the specified file name (if any) and
	 * makes sure they exist.
	 */
	var checkDirectories = function(fileName) {
		
	    var path = fileName.split("/");
	    if (path.length >= 2) {
	    	// Check all but the last path component to make sure that it exists...
	    	var currentPath = "";
	    	var startNdx = 0;
	    	if (path[0].length > 0) {
	    		// The "root" was not specified as the first parameter
	    		if (path[0].startsWith(".")) {
	    			currentPath = path[0];
	    			startNdx = 1;
	    		}
	    		else {
	    			currentPath = ".";
	    		}
	    	}
	    	else {
	    		startNdx = 1;
	    	}
	    	
	    	for (var i = startNdx; i < path.length-1; i++) {
	    	   currentPath = currentPath + "/" + path[i];
	    	   if (!fsx.existsSync(currentPath)) {
	    		   fsx.mkdirSync(currentPath);
	    	   }
	    	} // for
	    }
	};
	
	var aggFileList = [];
	
	var getAggregateFd = function(outputFileName) {

		// See if we have a file already open...
		for (var a = 0; a < aggFileList.length; a++) {
		   if (aggFileList[a].fileName === outputFileName) {
			   return aggFileList[a].fd;
		   }	
		} // for
		
		// If we get here, no file is open yet...
		var fd = fsx.openSync(outputFileName, "w");
		aggFileList.push({ "fileName" : outputFileName, "fd" : fd});
		
		return fd;
	};
	
	
	var writeToAggregateFile = function(outputFileName, result) {

		var fd = getAggregateFd(outputFileName);
		fsx.writeSync(fd, result);
		
	};

	
	var closeAllAggregateFiles = function() {

		for (var a = 0; a < aggFileList.length; a++) {
			fsx.closeSync(aggFileList[a].fd);
		} // for
		
		aggFileList = [];
	};
	
	
	var fileNameToProperty = function(fileName) {
		var propName = fileName;
		var lastSlash = fileName.lastIndexOf('/');
		if (lastSlash >= 0) {
			propName = fileName.slice(lastSlash+1, -1);
		}
		
		var lastDot = propName.indexOf(".");
		if (lastDot > 0) {
			propName = propName.slice(0, lastDot);
		}
		
		return propName;
	};
	

	function getDefaultOutputFileName(rootOutputPath, templateFile, metaClass) {
		// Constants
		const templatePrefix = 'plugins/templates';
		const hbsExtension = '.hbs';
	
		// Ensure the templateFile ends with '.hbs'
		let isHbsFile = templateFile.endsWith(hbsExtension);
	
		// Find the start of the relevant path in the templateFile
		const startIndex = templateFile.indexOf(templatePrefix);
		if (startIndex === -1) {
			throw new Error(`Template file must include '${templatePrefix}'`);
		}
	
		// Extract the relative path after 'plugins/templates'
		let relativePath = templateFile.slice(startIndex + templatePrefix.length);
	
		// Perform substitutions if metaClass is provided
		if (metaClass) {
			relativePath = relativePath
				.replace('{_package_}', metaClass.packageDirName || '') // Replace package placeholder
				.replace(`{${metaClass.stereotypeName}}`, metaClass.name || '') // Replace stereotype placeholder
				.replace(`{${metaClass.stereotypeName}_s}`, pluralize(metaClass.name || '')); // Replace plural stereotype placeholder
		}
	
		// Remove the '.hbs' extension if present
		let outputFileName;
		if (isHbsFile) {
		    outputFileName = relativePath.slice(0, -hbsExtension.length);
		}
		else {
		    outputFileName = relativePath;
		}
	
		// Combine the root output path with the transformed relative path
		return path.join(rootOutputPath, outputFileName);
	}
	

	var processTemplateFile = function(metaClass, templateFile, context) {
    	var templateData = fsx.readFileSync(templateFile, "utf8");

    	context["class"] = metaClass ;
    	context.output = mda.Options.output;
    	
    	winston.debug("      Processing " + (metaClass !== null ? metaClass.getName() : "project") + " with template " + templateFile);

    	var render;
    	var result;
    	try {
    	   render = Handlebars.compile(templateData);
    	   result = render(context);
    	}
    	catch (error) {
    		winston.error(`\n\nRender error in template file ${templateFile}:\n`);
    		winston.error(error.stack);
    		process.exit(-1);
    	}
    	

    	var outputFileName = "";
    	var outputMode = "overwrite";
    	if (result.indexOf("##output") >= 0) {
    		var lineBreak = result.indexOf("\n");
    		var outputDirective = result.slice(0, lineBreak).trim();
    		result = result.slice(lineBreak+1, -1);
    		var params = outputDirective.split(" ");
    		if (params.length === 2) {
    			outputMode= params[1];
    		}
    		else {
    		   outputMode = params[1];
    		   outputFileName = params[2];
    		}
    	}
    	else {
    		winston.warn("WARNING - No output directive found in tempalte file " + templateFile);
    	}

    	
    	if (outputFileName.length === 0) {
    		// No output directive specified.  Create a default output file name...
   		    outputFileName = getDefaultOutputFileName(mda.Options.output, templateFile, metaClass);
    	}
    	
		const templatePrefix = 'plugins/templates';
		const startIndex = templateFile.indexOf(templatePrefix);
		const abbrevTemplate = templateFile.slice(startIndex + templatePrefix.length);

    	winston.info(`      Generating ${outputFileName} from ${abbrevTemplate} with output mode "${outputMode}"`);
    	if (outputMode.toLowerCase() === "overwrite") {
        	checkDirectories(outputFileName);
        	fsx.writeFileSync(outputFileName, result);
    	}
    	else if (outputMode.toLowerCase().startsWith('preserve')) {
    	   // mode 'preserve' can be overridden with the 'forceOverwrite' option,
    	   // unless preserve ends with '!', which forces the preservation.
    	   let forceOW = mda.Options.forceOverwrite;
    	   if (outputMode.endsWith('!')) {
    	   	   forceOW = false;
    	   }
    	   if (!fsx.existsSync(outputFileName) || forceOW) {
    		   checkDirectories(outputFileName);
    		   fsx.writeFileSync(outputFileName, result);
    	   }
		   else {
    			winston.info("      >>> Preserved previous contents - Nothing saved.");
		   }
    	}
    	else if (outputMode.toLowerCase() === "aggregate") {
        	checkDirectories(outputFileName);
    		writeToAggregateFile(outputFileName, result);
    	}
    	else if (outputMode.toLowerCase() === "property") {
    		var propName = fileNameToProperty(outputFileName);
    	    if (!context.hasOwnProperty(propName)) {
    	    	context[propName] = [];
    	    }
    	    
    	    context[propName].push(result);
    	}
    	else if (outputMode.toLowerCase() === "ignore") {
    		// Do nothing...
    		winston.info("      >>> Nothing saved to file.");
     	}
    	else {
    		throw new Error("Unknown output directive '" + outputMode + "' in template " + templateFile);
    	}
    	
	};
	


	let uniquePackages = new Set();
	
	var processTemplateFileList = function(metaClass, templates, context) {
		uniquePackages.add(metaClass.getPackageName());
	    templates.forEach(function(templateFile) {
	    	processTemplateFile(metaClass, templateFile, context);
	    });
	};

	
	
	var execOnce = function(script, initType, typeName, typeValue, context) {

		if (typeof(script.execCache) === "undefined") {
			script.execCache = {};
		}

		var typeCache = script.execCache[initType];
		if (typeCache === undefined) {
			typeCache = {};
			script.execCache[initType] = typeCache;
		}
		
		var execFlag = typeCache[typeName];
		if (execFlag !== true) {
			// We have never executed this combination yet...
			typeCache[typeName] = true;
			var funcName = "init" + initType;
			var fn = script[funcName];
			if (typeof(fn) === "function") {
				var params = [];
				if (context !== null) {
					params.push(context);
				}
				params.push(typeValue);
				fn.apply(script, params);
			}
		} 
		
	};
	
	
	var loadPartials = function() {
		winston.debug("Loading partials...");
		var templateList = getFilesForPath("_partials", ".hbs");
		templateList.forEach(function(templateFile) {
			var parts = path.parse(templateFile);
			var partialName = parts.name;
			var templateData = fsx.readFileSync(templateFile, "utf8");			
			var partial = Handlebars.compile(templateData);
			Handlebars.registerPartial(partialName, partial);
		});
	};

	
	var fixFileName = function(fileName) {
		if (fileName.startsWith(".")) {
			// Relative file names need to be adjusted to absolute file names...
			fileName = process.cwd() + "/" + fileName;
		}
		return fileName;
	};

	
	/**
	 * Supplements the "require()" module loader to fix up relative paths in scripts
	 * loaded at runtime.
	 */
	var requireScript = function(fileName) {
		return require(fixFileName(fileName));
	};
	
	var loadHelpers = function() {
		winston.debug("Loading helpers...");
		var helperList = getFilesForPath("_helpers", ".js");
		helperList.forEach(function(helperFile) {
			var parts = path.parse(helperFile);
			var helperName = parts.name;
			var fn = requireScript(helperFile);			
			Handlebars.registerHelper(helperName, fn);
		});
	};
	
	
	mda.gen = function(modelFileName) {
		
		winston.info("Starting code generation.");
		
        winston.info("Discovering plugins for stack " + JSON.stringify(mda.Options.stack) + "...");
		initGeneratorContext(mda.Options.stack);
		winston.info("Validating stack...");
		if (!validateContext()) {
			return;
		}
		

		winston.info("Discovering plugin contents...");
		getPluginFiles();

		winston.info("Reading meta model...");
		var metaModel = MetaModel.Reader.getMeta(modelFileName);

		global._nodemda_runtime_model_ = metaModel;

		if (!mda.Meta.validate(metaModel)) {
			// We failed validation, just just stop processing.
			return;
		}
		
		var handlebarsContext = { model: metaModel, options: NodeMDA.Options };
		
		// Auto-load any Handlebar partials...
		winston.debug("Loading helpers...");
		loadHelpers();
		
		winston.debug("Loading partials...");
		loadPartials();

		winston.info("Loading and initializing platform support scripts...");
		var scriptCount = 0;
		var projectScripts = getFilesForPath("_mixin", ".js");
		projectScripts.forEach(function(s) {
		    scriptCount++;
			var script = requireScript(s);
			if (typeof(script.initPlatform) === "function") {
			    script.initPlatform(handlebarsContext);
			}
		});
		
		
		// Process each class...
		winston.info("Processing classes...");
		metaModel.classes.forEach(function(metaClass) {
			winston.info(`   Processing class ${metaClass.name}:`);
			metaClass.stereotypes.forEach(function(stereotype) {
				
				// Process any project scripts...
				projectScripts.forEach(function(ps) {
					var script = requireScript(ps);
					execOnce(script, "Stereotype", stereotype.getName(), stereotype, handlebarsContext);
					execOnce(script, "Class", metaClass.getName(), metaClass, handlebarsContext);
				});
								
				// Generate the templates...
			    var templates = getFilesForStereotype("templates", stereotype, ".hbs");
			    if (templates.length > 0) {
			    	scriptCount++;
			    }
			    processTemplateFileList(metaClass, templates, handlebarsContext);
			});
		});

		
		// Process any project template scripts...
		winston.info("Initializing project wide templates...");
		projectScripts.forEach(function(s) {
			var script = requireScript(s);
			if (typeof(script.initProjectTemplates) === "function") {
			    script.initProjectTemplates(handlebarsContext);
			}
		});

		
		// Finally, processall remaining template files...
		winston.info("Processing remaining templates...");
		// Regular expression to detect files with `{...}` in the file name slot
		const stereotypeMarkerRegex = /\/[^/]*\{[a-zA-Z0-9_]+?\}[^/]*$/;
		allFiles.forEach(function(file) {
			const virtualPath = file.virtualPath;
			if (virtualPath.startsWith('plugins/templates') && !stereotypeMarkerRegex.test(virtualPath)) {
				// This is a template file that is NOT stereotype specific...
				const sourceFile = file.absolutePath;
				if (sourceFile.endsWith(".hbs")) {
					// This is a handlebarstemplate file to be processed...
					processTemplateFile(null, sourceFile, handlebarsContext);
				}
				else {
					// This is a boilerplate file to be copied...
					const targetFile = getDefaultOutputFileName(mda.Options.output, sourceFile, null);
					if (mda.Options.forceOverwrite ||!fsx.existsSync(targetFile)) {
						winston.info("Creating boilerplate file " + targetFile);
						checkDirectories(targetFile);
						fsx.copyFileSync(sourceFile, targetFile);
					}
				}
			}
		});
				
		closeAllAggregateFiles();
		
		if (scriptCount === 0) {
			winston.error("No script or template files located. Is this stack valid?");
		}
		else {
		    winston.info("Done.");
	    }
		
	};
	
})(NodeMDA);	
