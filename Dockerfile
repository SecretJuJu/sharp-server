FROM node:18-alpine

# 필요한 시스템 라이브러리 설치
RUN apk add --no-cache \
    vips-dev \
    fftw-dev \
    build-base \
    python3 \
    g++ \
    make \
    libc6-compat

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

# PM2 전역 설치 (npm 사용)
RUN npm install -g pm2

# 소스 코드 복사
COPY . .

# 업로드 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# 포트 노출
EXPOSE 3000

# PM2로 애플리케이션 실행
CMD ["pm2-runtime", "start", "ecosystem.config.js"] 