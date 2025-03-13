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

# Sharp 모듈을 위한 환경 변수 설정
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV npm_config_platform=linuxmusl
ENV npm_config_arch=x64
ENV SHARP_DIST_BASE_URL=https://sharp.pixelplumbing.com/vendor/v0.32.6/

# 의존성 설치 (Sharp 모듈을 위한 특별 설정 포함)
RUN pnpm config set node-linker hoisted
RUN pnpm install --ignore-scripts=false
RUN pnpm rebuild sharp

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