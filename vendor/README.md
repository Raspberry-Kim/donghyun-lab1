# 빌드용 Markdown 변환 도구

`marked.cjs`는 npm의 `marked@15.0.12`에 포함된 `lib/marked.cjs` 원본이다. 앱 실행 시 로드하지 않고 `node build.cjs`에서 문서를 HTML로 변환할 때만 사용한다.

원 라이선스와 관련 고지는 `licenses/MARKED-MIT.txt`에 그대로 보존. `npm install`이나 CDN 연결 없이 빌드를 재현할 수 있도록 파일을 함께 배포한다.

문서 내 원시 HTML은 이 프로젝트의 `render-docs.cjs`에서 텍스트로 이스케이프하며, 허용하지 않은 URL 스킴을 제거한다. 라이선스 원문 외 문서는 실제 제목·굵게·목록·표·코드·링크로 변환한다.
