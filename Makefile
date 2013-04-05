
build: components index.js badge.js content.js worker.js process.js gifcast.css template.js
	@component build

template.js: template.html
	@component convert $<

components: component.json
	@component install

options: local/options
	@$(MAKE) -C local/options

clean:
	rm -fr build components template.js

.PHONY: clean options
