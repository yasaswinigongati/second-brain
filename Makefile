.PHONY: install dev backend frontend seed reindex

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

dev:
	@echo "Start backend in one terminal: make backend"
	@echo "Start frontend in another:     make frontend"

seed:
	cd backend && python utils/seed.py

reindex:
	cd backend && python utils/reindex.py

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down
