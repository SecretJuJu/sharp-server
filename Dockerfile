FROM node:18-alpine

# 필요한 시스템 라이브러리 설치
RUN apk add --no-cache \
    vips-dev \
    fftw-dev \
    build-base \
    python3 \
    g++ \
    make

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 작업 디렉토리 생성
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# PM2 전역 설치
RUN pnpm add -g pm2

# 소스 코드 복사
COPY . .

# 업로드 디렉토리 생성
RUN mkdir -p uploads && chmod 777 uploads

# 포트 노출
EXPOSE 3000

# PM2로 애플리케이션 실행
CMD ["pm2-runtime", "start", "ecosystem.config.js"] 