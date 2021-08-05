class ContentModel {
	constructor() {
		this.data = {
			links: [
				{ name: 'Click here', url: '/click-here' },
				{ name: 'Try another', url: '/try-another' },
				{ name: 'And the last link', url: '/and-the-last-link' },
				{ name: 'Send me home', url: '/' }
			]
		};
	}
	getLinks() {
		return this.data.links;
	}
	setPath(value) {
		this.data.path = value;
	}
	getPath() {
		return this.data.path;
	}
}

module.exports = ContentModel;
