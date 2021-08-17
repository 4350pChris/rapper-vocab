const colors = require('tailwindcss/colors')
const theme = require('tailwindcss/defaultTheme')

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
			},
			fontFamily: {
				sans: ["Montserrat", ...theme.fontFamily.sans]
			}
		}
	},
	plugins: [
		require("@tailwindcss/line-clamp"),
	]
};

module.exports = config;
