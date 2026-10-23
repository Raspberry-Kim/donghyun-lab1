# donghyun-lab1: GitHub 개설·게시 안내

이 안내는 준비된 파일을 사용자가 자신의 GitHub 계정에 업로드하는 절차다. ZIP 자체를 올리는 것이 아니라 압축을 풀고 그 안의 파일과 폴더를 올린다.

## 저장소 만들기

GitHub에 로그인하고 우측 상단 `+` → `New repository`를 선택한다. Owner는 본인 계정, Repository name은 `donghyun-lab1`, 공개 범위는 `Public`으로 지정한다. README·.gitignore·라이선스는 이미 준비되어 있으므로 초기 생성 항목은 선택하지 않고 `Create repository`를 누른다. ([GitHub 공식 생성 안내](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository))

Description에는 다음 문구를 권장한다.

```text
동현초™: 동현랭만 알아듣는 초파리의 회로실험실. FlyWire 연결망으로 신경 반응을 계산하는 비상업적 교육용 웹앱.
```

## 파일 올리기

1. `donghyun-lab1-v0.3.zip`을 압축 해제한다.
2. 만들어진 `donghyun-lab1` 폴더를 연다.
3. 새 저장소의 `uploading an existing file`을 누른다. 이미 파일이 있다면 `Add file` → `Upload files`로 들어간다.
4. **폴더 바깥 껍데기가 아니라, 안에 있는 index.html·README.md 등의 파일과 src·data 등의 하위 폴더를 한꺼번에** 업로드 영역으로 끌어 놓는다.
5. 커밋 메시지를 `Initial release of Donghyuncho v0.3`으로 적고 `main` 브랜치에 커밋한다.
6. 저장소 첫 화면에 `index.html`과 `README.md`가 바로 보이는지 확인한다. `donghyun-lab1/index.html`처럼 한 단계 더 들어가야 한다면 루트 위치를 수정한다.

브라우저 업로드는 한 번에 100개 파일, 파일 하나당 25 MiB까지 허용된다. 이 묶음은 그 제한보다 적고, 완성 HTML도 약 4.8 MB다. ZIP만 올리면 GitHub가 웹사이트용 파일로 자동 해제하지 않으므로 반드시 먼저 압축을 푼다. ([GitHub 파일 업로드 안내](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository))

Mac에서 `.gitignore`와 `.nojekyll`은 숨김 파일이다. Finder에서 Command+Shift+.로 표시할 수 있다. 둘을 빠뜨려도 현재 단일 HTML의 기본 실행에는 지장이 없지만, 저장소 관리용으로 함께 올리는 것을 권장한다.

## GitHub Pages 켜기

저장소에서 `Settings` → `Pages` → `Build and deployment`로 이동한다. 아래처럼 설정하고 `Save`를 누른다. ([GitHub Pages 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site))

| 항목 | 값 |
|---|---|
| Source | Deploy from a branch |
| Branch | main |
| Folder | / (root) |

배포가 끝나면 같은 페이지의 `Visit site`로 연다. 실제 게시 주소는 GitHub가 표시하는 주소를 기준으로 확인한다. 이 문서는 아직 저장소 생성이나 공개 배포가 완료되었다는 뜻이 아니다.

기존 계정 `raspberry-kim` 아래에 `donghyun-lab1`을 만든다면 예상 주소는 다음과 같다. 생성 전에는 접속 가능한 주소로 간주하지 않는다.

```text
https://raspberry-kim.github.io/donghyun-lab1/
```

페이지가 404이면 먼저 `main`의 루트에 `index.html`이 있는지, Pages가 `/ (root)`를 가리키는지, Pages 배포가 완료되었는지 확인한다. `src/index.html`은 빌드 전 템플릿이므로 게시용 파일로 대체하지 않는다.

## About 설정과 최종 확인

저장소 첫 화면 오른쪽 `About` 옆 톱니바퀴에서 소개 문구와 게시된 Website 주소를 넣는다. Topics는 `donghyun-lang`, `esolang`, `drosophila`, `connectome`, `flywire`, `educational`, `simulation` 정도를 권장한다. 입력 후 `Save changes`로 저장한다. ([GitHub About·Topics 설정 안내](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics))

게시 후 03번을 실행해 두 장애물에 닿는지, 08~10번이 선택되는지, 11번이 1초 동안 움직이지 않는지 확인한다. ‘모델과 출처’에서 인용·이용 조건이 보이고 동현랭 실행기 링크도 열리는지 확인하면 된다.

## 다음 수정 때

완성 HTML만 교체하려면 저장소 루트의 `index.html`을 새 파일로 덮어써 커밋한다. 소스도 관리하려면 전체 최신 묶음을 갱신하되 `README`, 출처 문서, 라이선스는 삭제하지 않는다.

직접 코드를 수정할 때는 `src/`를 고치고 `npm test`, `npm run build`를 실행한다. 빌드가 만든 루트 `index.html`을 커밋해야 Pages에 반영된다.
