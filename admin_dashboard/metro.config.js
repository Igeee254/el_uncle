const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Force Metro to stay in this folder
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

// Map App.js to ensure it doesn't wander off
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

module.exports = config;
