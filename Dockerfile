FROM node:18-alpine

# 빌드 인자 정의
ARG HTTP_SSL_CERT
ARG HTTP_SSL_KEY

# 환경 변수로 설정
ENV HTTP_SSL_CERT=$HTTP_SSL_CERT
ENV HTTP_SSL_KEY=$HTTP_SSL_KEY

# 필요한 시스템 라이브러리 설치
RUN apk add --no-cache \
    vips-dev \
    fftw-dev \
    build-base \
    python3 \
    g++ \
    make \
    libc6-compat \
    nginx

# pnpm 설치 및 환경 설정
RUN corepack enable && corepack prepare pnpm@10.6.2 --activate
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN mkdir -p $PNPM_HOME

# 작업 디렉토리 생성
WORKDIR /app

# 패키지 파일 복사
COPY package.json pnpm-lock.yaml* ./

# Sharp 모듈을 Alpine Linux(linuxmusl-x64)에 맞게 설치
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV npm_config_platform=linuxmusl
ENV npm_config_arch=x64
ENV npm_config_libc=musl

# 의존성 설치
RUN pnpm install --no-frozen-lockfile

# Sharp 모듈 재빌드 (Alpine Linux 환경에 맞게)
RUN cd /app/node_modules/sharp && npm rebuild --platform=linuxmusl --arch=x64

# SSL 인증서 디렉토리 생성
RUN mkdir -p /etc/nginx/ssl

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 소스 코드 복사
COPY . .

# 업로드 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# 포트 노출 (HTTP 및 HTTPS)
EXPOSE 80 443

# 시작 스크립트 생성
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "$HTTP_SSL_CERT" > /etc/nginx/ssl/cert.pem' >> /start.sh && \
    echo 'echo "$HTTP_SSL_KEY" > /etc/nginx/ssl/key.pem' >> /start.sh && \
    echo 'chmod 600 /etc/nginx/ssl/cert.pem /etc/nginx/ssl/key.pem' >> /start.sh && \
    echo 'nginx' >> /start.sh && \
    echo 'node server/server.js' >> /start.sh && \
    chmod +x /start.sh

# 시작 스크립트 실행
CMD ["/start.sh"] 