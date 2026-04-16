# syntax=docker/dockerfile:1

FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY *.go ./

RUN go mod tidy && go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o /scheduler .

FROM alpine:3.19

RUN apk add --no-cache ca-certificates curl

WORKDIR /app
COPY --from=builder /scheduler .

EXPOSE 8080

ENV GIN_MODE=release

CMD ["./scheduler", "server"]
