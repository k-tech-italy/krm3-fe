clean: ## clean development tree
	rm -fr node_modules .yarn


build:
	KRM3_FE_API_BASE_URL=https://krm3int.k-tech.it/api/v1/ yarn build