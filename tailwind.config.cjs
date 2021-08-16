const colors = require('tailwindcss/colors')

const config = {
	mode: 'jit',
	darkMode: 'media',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				gray: colors.trueGray,
				blue: colors.cyan,
				green: colors.emerald,
			}
		}
	},
	plugins: [
		require("@tailwindcss/line-clamp"),
	]
};

module.exports = config;
