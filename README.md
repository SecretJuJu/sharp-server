# 이미지 변환 서비스

이미지 변환 서비스는 다양한 해상도와 품질로 이미지를 변환할 수 있는 웹 애플리케이션입니다. 이 서비스는 AWS ECS에서 ARM64 기반 스팟 인스턴스를 사용하여 비용 효율적으로 운영됩니다.

## 주요 기능

- 단일 이미지 변환: 이미지 해상도와 품질 조정
- 배치 이미지 변환: 여러 해상도와 품질 조합으로 한 번에 변환
- 다양한 이미지 형식 지원: JPEG, PNG, WebP, AVIF, TIFF
- JPEG 고급 옵션: 프로그레시브 모드, 스캔 최적화, 트렐리스 양자화 등

## 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: Node.js, Express
- **이미지 처리**: Sharp 라이브러리
- **컨테이너화**: Docker, PM2
- **인프라**: AWS ECS, Fargate, EC2 스팟 인스턴스, EFS, CloudFormation, API Gateway
- **CI/CD**: GitHub Actions
- **패키지 관리**: pnpm

## 배포 방법

### 사전 요구 사항

- AWS 계정
- GitHub 계정
- AWS VPC 및 서브넷 ID
- (선택 사항) Cloudflare에 등록된 도메인

### GitHub Secrets 설정

GitHub 저장소에 다음 시크릿을 설정합니다:

- `AWS_ACCESS_KEY_ID`: AWS 액세스 키 ID
- `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 액세스 키

### IAM 권한 설정

배포에 사용되는 IAM 사용자에게는 다음과 같은 권한이 필요합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage",
        "ecr:CreateRepository",
        "ecr:DescribeRepositories",
        "ecr:PutLifecyclePolicy",
        "ecr:PutImageTagMutability"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:RegisterTaskDefinition",
        "ecs:DeregisterTaskDefinition",
        "ecs:ListTaskDefinitions",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeServices",
        "ecs:UpdateService",
        "ecs:DescribeClusters",
        "ecs:CreateCluster",
        "ecs:ListClusters",
        "ecs:DeleteCluster"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:PutRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:DeleteRolePolicy"
      ],
      "Resource": "arn:aws:iam::*:role/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ValidateTemplate"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:CreateSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:DeleteSecurityGroup",
        "ec2:RunInstances",
        "ec2:TerminateInstances",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:CreateTags",
        "ec2:DescribeTags",
        "ec2:CreateLaunchTemplate",
        "ec2:DeleteLaunchTemplate",
        "ec2:DescribeLaunchTemplates",
        "ec2:DescribeLaunchTemplateVersions"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "elasticfilesystem:CreateFileSystem",
        "elasticfilesystem:DeleteFileSystem",
        "elasticfilesystem:DescribeFileSystems",
        "elasticfilesystem:CreateMountTarget",
        "elasticfilesystem:DeleteMountTarget",
        "elasticfilesystem:DescribeMountTargets",
        "elasticfilesystem:CreateTags",
        "elasticfilesystem:DescribeTags"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:DescribeLogGroups",
        "logs:CreateLogStream",
        "logs:DeleteLogStream",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "autoscaling:CreateAutoScalingGroup",
        "autoscaling:UpdateAutoScalingGroup",
        "autoscaling:DeleteAutoScalingGroup",
        "autoscaling:DescribeAutoScalingGroups",
        "autoscaling:DescribeScalingActivities",
        "autoscaling:CreateLaunchConfiguration",
        "autoscaling:DeleteLaunchConfiguration",
        "autoscaling:DescribeLaunchConfigurations",
        "autoscaling:PutScalingPolicy",
        "autoscaling:DeletePolicy",
        "autoscaling:DescribePolicies"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "application-autoscaling:RegisterScalableTarget",
        "application-autoscaling:DeregisterScalableTarget",
        "application-autoscaling:DescribeScalableTargets",
        "application-autoscaling:PutScalingPolicy",
        "application-autoscaling:DeleteScalingPolicy",
        "application-autoscaling:DescribeScalingPolicies"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters",
        "ssm:GetParameter"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/aws/service/ecs/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "elasticloadbalancing:CreateLoadBalancer",
        "elasticloadbalancing:DeleteLoadBalancer",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:ModifyLoadBalancerAttributes",
        "elasticloadbalancing:CreateListener",
        "elasticloadbalancing:DeleteListener",
        "elasticloadbalancing:DescribeListeners",
        "elasticloadbalancing:CreateTargetGroup",
        "elasticloadbalancing:DeleteTargetGroup",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:RegisterTargets",
        "elasticloadbalancing:DeregisterTargets",
        "elasticloadbalancing:DescribeTargetHealth"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "apigateway:GET",
        "apigateway:POST",
        "apigateway:PUT",
        "apigateway:DELETE",
        "apigateway:PATCH"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "acm:ListCertificates",
        "acm:DescribeCertificate",
        "acm:GetCertificate"
      ],
      "Resource": "*"
    }
  ]
}
```

이 정책은 다음과 같은 AWS 서비스에 대한 권한을 포함합니다:

- **ECR**: 도커 이미지 저장소 관리
- **ECS**: 컨테이너 서비스 관리
- **IAM**: 역할 및 정책 관리
- **CloudFormation**: 인프라 스택 관리
- **EC2**: 인스턴스 및 네트워크 리소스 관리
- **EFS**: 파일 시스템 관리
- **CloudWatch Logs**: 로그 관리
- **Auto Scaling**: 자동 확장 그룹 관리
- **Application Auto Scaling**: 애플리케이션 자동 확장 관리
- **SSM**: 시스템 관리자 파라미터 접근
- **Elastic Load Balancing**: 로드 밸런서 관리
- **API Gateway**: API 게이트웨이 관리
- **ACM**: 인증서 관리

### 배포 단계

1. **인프라 배포**:
   - GitHub Actions 탭에서 "Deploy AWS Infrastructure" 워크플로우를 실행합니다.
   - 필요한 파라미터를 입력합니다:
     - VPC ID
     - 서브넷 ID (쉼표로 구분)
     - 인스턴스 타입 (기본값: t4g.small)
     - Auto Scaling 그룹 최소 크기 (기본값: 0)
     - Auto Scaling 그룹 최대 크기 (기본값: 2)
     - Auto Scaling 그룹 원하는 용량 (기본값: 0)
     - (선택 사항) ACM 인증서 ARN: 사용자 정의 도메인을 사용하려면 입력

2. **애플리케이션 배포**:
   - 인프라 배포가 완료되면 "Deploy to Amazon ECS" 워크플로우가 자동으로 실행됩니다.
   - 또는 코드 변경 후 main 브랜치에 푸시하면 자동으로 배포됩니다.

3. **사용자 정의 도메인 설정 (선택 사항)**:
   - **중요**: Cloudflare와 API Gateway 연결은 수동으로 설정해야 합니다.
   - 아래 "Cloudflare와 API Gateway 연결" 섹션을 참조하세요.

## Cloudflare와 API Gateway 연결

Cloudflare에 등록된 도메인(예: secretjuju.kr)을 API Gateway에 연결하려면 다음 단계를 수행해야 합니다:

### 1. AWS Certificate Manager(ACM)에서 인증서 발급

1. AWS 콘솔에서 ACM으로 이동합니다.
2. "인증서 요청"을 클릭합니다.
3. 퍼블릭 인증서 요청을 선택합니다.
4. 도메인 이름에 `sharp.secretjuju.kr`을 입력합니다.
5. DNS 검증 방식을 선택합니다.
6. 요청을 완료하고 검증을 위한 CNAME 레코드 정보를 확인합니다.

### 2. Cloudflare에서 DNS 검증 레코드 추가

1. Cloudflare 대시보드에서 secretjuju.kr 도메인으로 이동합니다.
2. DNS 섹션으로 이동합니다.
3. ACM에서 제공한 CNAME 레코드를 추가합니다:
   - 이름: ACM에서 제공한 이름 (예: `_x1.sharp.secretjuju.kr`)
   - 대상: ACM에서 제공한 값
   - 프록시 상태: 프록시 비활성화 (회색 구름)

4. 인증서가 검증될 때까지 기다립니다 (보통 몇 분에서 몇 시간 소요).

### 3. 인프라 배포 시 인증서 ARN 제공

1. 인증서가 검증되면 인증서의 ARN을 복사합니다.
2. "Deploy AWS Infrastructure" 워크플로우를 실행할 때 인증서 ARN을 입력합니다.

### 4. API Gateway 사용자 정의 도메인 설정 확인

1. 배포가 완료되면 AWS 콘솔에서 API Gateway로 이동합니다.
2. "사용자 정의 도메인 이름"에서 `sharp.secretjuju.kr`이 추가되었는지 확인합니다.
3. API Gateway에서 제공하는 대상 도메인 이름을 확인합니다 (예: `d-abcdef123.execute-api.ap-northeast-2.amazonaws.com`).

### 5. Cloudflare에서 API Gateway 연결 CNAME 추가

1. Cloudflare 대시보드에서 DNS 섹션으로 이동합니다.
2. 다음과 같은 CNAME 레코드를 추가합니다:
   - 이름: `sharp` (서브도메인)
   - 대상: API Gateway에서 제공한 대상 도메인 이름
   - 프록시 상태: 프록시 활성화 (주황색 구름)

3. SSL/TLS 섹션에서 "전체" 또는 "전체(엄격)" 모드를 선택합니다.

### 6. 연결 확인

1. 브라우저에서 `https://sharp.secretjuju.kr`로 접속하여 서비스가 정상적으로 작동하는지 확인합니다.
2. 문제가 있는 경우 Cloudflare의 SSL/TLS 설정과 DNS 설정을 확인합니다.

## 자동 스케일링

이 서비스는 다음과 같은 자동 스케일링 기능을 제공합니다:

- **스케일 아웃**: CPU 사용률이 70%를 초과하면 자동으로 인스턴스가 추가됩니다.
- **스케일 인**: 사용량이 적을 때 자동으로 인스턴스가 종료됩니다.
- **최소 인스턴스 수**: 0 (사용하지 않을 때는 비용이 발생하지 않음)
- **최대 인스턴스 수**: 4 (필요에 따라 조정 가능)

## 로컬 개발

### 로컬에서 실행하기

```bash
# pnpm 설치 (처음 한 번만)
corepack enable
corepack prepare pnpm@latest --activate

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm run dev
```

### Docker로 실행하기

```bash
# Docker 이미지 빌드
docker build -t sharp-server .

# Docker 컨테이너 실행
docker run -p 3000:3000 sharp-server
```

## 라이선스

ISC 