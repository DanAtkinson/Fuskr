module.exports = {
	performance: {
		// Disable webpack performance warnings for browser extensions
		// Extensions don't load over the network so size warnings aren't as relevant
		hints: false,
	},
};
