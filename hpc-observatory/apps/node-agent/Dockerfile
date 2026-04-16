# syntax=docker/dockerfile:1

FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY cmd/ ./cmd/

RUN go mod tidy && go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o /node-agent ./cmd

FROM alpine:3.19

RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=builder /node-agent .

CMD ["./node-agent"]
