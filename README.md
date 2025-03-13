# 이미지 변환 서비스

이미지 변환 서비스는 다양한 해상도와 품질로 이미지를 변환할 수 있는 웹 애플리케이션입니다. 이 서비스는 AWS ECS에서 x86_64 기반 스팟 인스턴스를 사용하여 비용 효율적으로 운영됩니다.

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
- **인프라**: AWS ECS, Fargate, EC2 스팟 인스턴스(x86_64), EFS, CloudFormation, API Gateway
- **CI/CD**: GitHub Actions
- **패키지 관리**: pnpm

## 아키텍처 구성

이 서비스는 다음과 같은 아키텍처로 구성되어 있습니다:

```
API Gateway → VPC Link → NLB → ECS (Fargate/EC2 Spot)
```

### 구성 요소 설명

1. **API Gateway**: 
   - HTTPS 엔드포인트 제공
   - 사용자 정의 도메인 및 SSL/TLS 인증서 지원
   - CORS 설정 및 요청/응답 변환

2. **VPC Link**: 
   - API Gateway와 VPC 내부 리소스 연결
   - 프라이빗 네트워크 통신 지원

3. **Network Load Balancer (NLB)**: 
   - TCP 레벨 로드 밸런싱
   - 고성능 및 낮은 지연 시간
   - ECS 서비스로 트래픽 분산

4. **ECS (Elastic Container Service)**:
   - Fargate: 서버리스 컨테이너 실행
   - EC2 Spot: 비용 효율적인 컨테이너 실행
   - 자동 확장 및 장애 복구

5. **EFS (Elastic File System)**:
   - 영구 스토리지 제공
   - 컨테이너 간 파일 공유

## 배포 방법

### 사전 요구 사항

- AWS 계정
- GitHub 계정
- AWS VPC 및 서브넷 ID
- ACM 인증서 (API Gateway 사용자 정의 도메인용)

### IAM 권한 요구사항

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
        "ecs:DeleteCluster",
        "ecs:CreateService",
        "ecs:DeleteService",
        "ecs:ListTasks",
        "ecs:DescribeTasks",
        "ecs:RunTask",
        "ecs:StopTask",
        "ecs:UpdateService"
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
        "iam:CreateServiceLinkedRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/aws-service-role/elasticloadbalancing.amazonaws.com/AWSServiceRoleForElasticLoadBalancing",
        "arn:aws:iam::*:role/aws-service-role/ecs.amazonaws.com/AWSServiceRoleForECS",
        "arn:aws:iam::*:role/aws-service-role/apigateway.amazonaws.com/AWSServiceRoleForAPIGateway"
      ]
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
        "ec2:DescribeLaunchTemplateVersions",
        "ec2:DescribeNetworkInterfaces",
        "ec2:CreateNetworkInterface",
        "ec2:DeleteNetworkInterface",
        "ec2:DescribeNetworkInterfaceAttribute",
        "ec2:ModifyNetworkInterfaceAttribute",
        "ec2:DescribeAccountAttributes"
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
        "logs:PutLogEvents",
        "logs:GetLogEvents"
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
        "elasticloadbalancing:DescribeTargetHealth",
        "elasticloadbalancing:SetSecurityGroups",
        "elasticloadbalancing:SetSubnets",
        "elasticloadbalancing:AddTags",
        "elasticloadbalancing:RemoveTags",
        "elasticloadbalancing:ModifyTargetGroupAttributes",
        "elasticloadbalancing:ModifyTargetGroup",
        "elasticloadbalancing:ModifyListenerAttributes"
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
        "apigateway:PATCH",
        "apigateway:TagResource",
        "apigateway:UntagResource"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "acm:ListCertificates",
        "acm:DescribeCertificate",
        "acm:GetCertificate",
        "acm:RequestCertificate",
        "acm:AddTagsToCertificate"
      ],
      "Resource": "*"
    }
  ]
}
```

### API Gateway와 VPC Link 관련 권한

API Gateway와 VPC Link를 설정하기 위해 다음과 같은 추가 권한이 필요합니다:

1. **API Gateway 권한**:
   - apigateway:GET, POST, PUT, DELETE, PATCH: API Gateway 리소스 관리
   - apigateway:TagResource, UntagResource: API Gateway 리소스 태그 관리

2. **VPC Link 권한**:
   - ec2:CreateNetworkInterface, DeleteNetworkInterface: VPC Link가 VPC 내부 리소스와 통신하기 위한 네트워크 인터페이스 관리
   - ec2:DescribeNetworkInterfaces: 네트워크 인터페이스 정보 조회
   - ec2:ModifyNetworkInterfaceAttribute: 네트워크 인터페이스 속성 수정

3. **서비스 연결 역할 권한**:
   - iam:CreateServiceLinkedRole: API Gateway 서비스 연결 역할 생성

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
     - ACM 인증서 ARN: API Gateway 사용자 정의 도메인을 위한 인증서 ARN

2. **애플리케이션 배포**:
   - 인프라 배포가 완료되면 "Deploy to Amazon ECS" 워크플로우가 자동으로 실행됩니다.
   - 또는 코드 변경 후 main 브랜치에 푸시하면 자동으로 배포됩니다.

3. **사용자 정의 도메인 설정**:
   - API Gateway 사용자 정의 도메인을 사용하려면 DNS 제공업체(예: Cloudflare)에서 CNAME 레코드를 추가해야 합니다.
   - API Gateway 도메인 이름(예: d-abcdef123.execute-api.ap-northeast-2.amazonaws.com)을 대상으로 하는 CNAME 레코드를 생성합니다.

## API Gateway와 NLB 연결 구조 이해하기

### 1. API Gateway HTTP API

API Gateway HTTP API는 RESTful API를 생성하고 관리하는 서비스입니다. 이 프로젝트에서는 다음과 같은 기능을 제공합니다:

- HTTPS 엔드포인트 제공
- 사용자 정의 도메인 지원
- CORS 설정
- 요청 및 응답 변환

### 2. VPC Link

VPC Link는 API Gateway와 VPC 내부 리소스(이 경우 NLB) 간의 연결을 제공합니다:

- API Gateway가 VPC 내부 리소스에 안전하게 액세스할 수 있도록 함
- 프라이빗 네트워크 통신 지원
- 보안 그룹 및 서브넷 설정 적용

### 3. Network Load Balancer (NLB)

NLB는 TCP 레벨에서 트래픽을 로드 밸런싱합니다:

- 고성능 및 낮은 지연 시간
- TCP 프로토콜 지원 (SSL/TLS 종료 기능 없음)
- ECS 서비스로 트래픽 분산

### 4. ECS Service

ECS 서비스는 컨테이너화된 애플리케이션을 실행합니다:

- Fargate: 서버리스 컨테이너 실행
- EC2 Spot: 비용 효율적인 컨테이너 실행
- 자동 확장 및 장애 복구

### 트래픽 흐름

1. 클라이언트가 API Gateway 엔드포인트로 HTTPS 요청을 보냅니다.
2. API Gateway는 요청을 처리하고 VPC Link를 통해 NLB로 전달합니다.
3. NLB는 요청을 ECS 서비스의 컨테이너로 라우팅합니다.
4. ECS 서비스는 요청을 처리하고 응답을 반환합니다.
5. 응답은 동일한 경로를 통해 클라이언트에게 전달됩니다.

## 주의 사항

1. **NLB SSL/TLS 제한**: NLB는 SSL/TLS 종료를 지원하지 않습니다. SSL/TLS 종료는 API Gateway에서 처리됩니다.
2. **API Gateway 제한 시간**: API Gateway의 기본 제한 시간은 30초입니다. 오래 실행되는 작업의 경우 이 제한 시간을 고려해야 합니다.
3. **VPC Link 비용**: VPC Link 사용에는 추가 비용이 발생합니다. 자세한 내용은 AWS 요금 페이지를 참조하세요.
4. **API Gateway 스테이지**: 기본적으로 `$default` 스테이지가 사용됩니다. 이는 URL에 스테이지 이름이 포함되지 않음을 의미합니다.