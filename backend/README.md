To install
```bash
pip install fastapi
pip install "uvicorn[standard]"
pip install websockets
```
To start
```bash
uvicorn main:app --port 80 --reload

curl http://localhost:80/initializeCenters
```
Endpoints:
```
http://127.0.0.1:8000
http://127.0.0.1:8000/docs
```