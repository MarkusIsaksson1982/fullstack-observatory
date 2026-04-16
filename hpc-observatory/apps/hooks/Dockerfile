# syntax=docker/dockerfile:1

FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir prometheus-client python-dotenv

COPY hooks/*.py .

ENV PYTHONUNBUFFERED=1

CMD ["python", "-u", "exporter.py"]
