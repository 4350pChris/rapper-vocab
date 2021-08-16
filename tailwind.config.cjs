const config = {
	mode: 'jit',
	darkMode: 'media',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [
		require("@tailwindcss/line-clamp"),
	]
};

module.exports = config;
