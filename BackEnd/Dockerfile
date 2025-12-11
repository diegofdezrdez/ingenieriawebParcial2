FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer el puerto que usa este backend internamente
EXPOSE 8001

CMD ["python", "main.py"]